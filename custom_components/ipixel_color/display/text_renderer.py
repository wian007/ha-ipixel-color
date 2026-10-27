"""Text rendering for iPIXEL Color displays."""
from __future__ import annotations

import io
import logging

from PIL import Image, ImageDraw, ImageFont

from ..color import hex_to_rgb
from ..fonts import get_font_path
from .font_cache import FontCache, get_font_cache  # noqa: F401 - re-exported

_LOGGER = logging.getLogger(__name__)

# Minimum font size to try
MIN_FONT_SIZE = 4
MARGIN_THRESHOLD = 64  # Pixel brightness threshold for margin detection


def render_text_to_png(
    text: str,
    width: int,
    height: int,
    antialias: bool = True,
    font_size: float | None = None,
    font: str | None = None,
    line_spacing: int = 0,
    text_color: str = "ffffff",
    bg_color: str = "000000",
) -> bytes:
    """Render text to PNG bytes (see :func:`render_text_image`)."""
    image = render_text_image(
        text, width, height, antialias, font_size, font, line_spacing, text_color, bg_color
    )
    png_buffer = io.BytesIO()
    image.save(png_buffer, format="PNG")
    return png_buffer.getvalue()


def render_text_image(
    text: str,
    width: int,
    height: int,
    antialias: bool = True,
    font_size: float | None = None,
    font: str | None = None,
    line_spacing: int = 0,
    text_color: str = "ffffff",
    bg_color: str = "000000",
) -> Image.Image:
    """Render (multi-line) text centred on a ``width``x``height`` RGB image.

    Args:
        text: Text to render (``\n`` separates lines)
        width: Canvas width in pixels
        height: Canvas height in pixels
        antialias: Smooth text (True) or crisp 1-bit pixels (False)
        font_size: Fixed font size in pixels, or None/0 for the largest size that fits
        font: Font file name from the fonts folders, or None for the PIL default
        line_spacing: Extra pixels between lines
        text_color: Text colour as hex (``ffffff``)
        bg_color: Background colour as hex (``000000``)

    The grayscale rendering is mapped linearly from ``bg_color`` (0) to
    ``text_color`` (255) so antialiased edges blend into the background.
    """
    if not font_size:
        font_size = None

    gray_mode = "L" if antialias else "1"
    img = Image.new(gray_mode, (max(1, width), max(1, height)), 0)
    draw = ImageDraw.Draw(img)

    lines = text.split("\n") if text else [""]

    if font_size is not None:
        font_obj = get_fixed_font(font_size, font)
    else:
        font_obj = get_optimal_font(draw, lines, width, height, font, line_spacing)

    # Measure every line so we can centre the block of text precisely.
    line_data = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font_obj)
        line_data.append(
            {
                "text": line,
                "left": bbox[0],
                "top": bbox[1],
                "width": bbox[2] - bbox[0],
                "height": bbox[3] - bbox[1],
            }
        )

    total_height = sum(data["height"] for data in line_data)
    if len(lines) > 1:
        total_height += line_spacing * (len(lines) - 1)
    current_y = (height - total_height) // 2

    fill = 255 if antialias else 1
    for data in line_data:
        x = (width - data["width"]) // 2 - data["left"]
        y = current_y - data["top"]
        draw.text((x, y), data["text"], font=font_obj, fill=fill)
        current_y += data["height"] + line_spacing

    try:
        bg_rgb = hex_to_rgb(bg_color)
        text_rgb = hex_to_rgb(text_color)
    except (ValueError, IndexError):
        _LOGGER.error("Invalid color format, using white text on black background")
        bg_rgb, text_rgb = (0, 0, 0), (255, 255, 255)

    return colorize_grayscale(img.convert("L"), text_rgb, bg_rgb)


def colorize_grayscale(
    gray: Image.Image,
    text_rgb: tuple[int, int, int],
    bg_rgb: tuple[int, int, int],
) -> Image.Image:
    """Map a grayscale image linearly from ``bg_rgb`` (0) to ``text_rgb`` (255)."""
    channels = []
    for bg_value, text_value in zip(bg_rgb, text_rgb):
        lut = [int(bg_value + (text_value - bg_value) * value / 255) for value in range(256)]
        channels.append(gray.point(lut))
    return Image.merge("RGB", channels)


def _calculate_content_bounds(img: Image.Image) -> tuple[int, int, int, int] | None:
    """Calculate actual content bounds by analyzing pixels.
    
    Args:
        img: Grayscale image with text content
        
    Returns:
        Tuple of (left, top, right, bottom) bounds or None if no content
    """
    width, height = img.size
    pixels = img.load()

    # Find top boundary (first row with bright pixels)
    top = None
    for y in range(height):
        for x in range(width):
            if pixels[x, y] > MARGIN_THRESHOLD:
                top = y
                break
        if top is not None:
            break

    if top is None:
        return None  # No content found

    # Find bottom boundary (last row with bright pixels)
    bottom = None
    for y in range(height - 1, -1, -1):
        for x in range(width):
            if pixels[x, y] > MARGIN_THRESHOLD:
                bottom = y + 1  # +1 because we want inclusive bounds
                break
        if bottom is not None:
            break

    # Find left boundary (first column with bright pixels)
    left = None
    for x in range(width):
        for y in range(top, bottom):
            if pixels[x, y] > MARGIN_THRESHOLD:
                left = x
                break
        if left is not None:
            break

    # Find right boundary (last column with bright pixels)
    right = None
    for x in range(width - 1, -1, -1):
        for y in range(top, bottom):
            if pixels[x, y] > MARGIN_THRESHOLD:
                right = x + 1  # +1 because we want inclusive bounds
                break
        if right is not None:
            break

    if left is None or right is None:
        return None

    _LOGGER.debug("Content bounds: left=%d, top=%d, right=%d, bottom=%d (content: %dx%d)",
                 left, top, right, bottom, right - left, bottom - top)

    return left, top, right, bottom


def get_fixed_font(size: float, font_name: str | None = None) -> ImageFont.FreeTypeFont:
    """Get font with fixed size.
    
    Args:
        size: Font size in pixels (can be fractional)
        font_name: Optional font name from fonts/ folder
        
    Returns:
        Font object with the specified size
    """
    try:
        # Try to load custom font from fonts/ folder first
        if font_name:
            font_path = get_font_path(font_name)
            if font_path:
                try:
                    return ImageFont.truetype(str(font_path), size)
                except Exception as e:
                    _LOGGER.warning("Could not load custom font %s: %s", font_name, e)

        # Use default font if custom font failed or not specified
        return ImageFont.load_default()
    except Exception as e:
        _LOGGER.warning("Error loading font size %.1f: %s, using default", size, e)
        return ImageFont.load_default()


def get_optimal_font(draw: ImageDraw.Draw, lines: list[str],
                     max_width: int, max_height: int, font_name: str | None = None, line_spacing: int = 0) -> ImageFont.FreeTypeFont:
    """Find the largest font size that fits all text within dimensions.
    
    Args:
        draw: ImageDraw object for text measurement
        lines: List of text lines to render
        max_width: Maximum width in pixels
        max_height: Maximum height in pixels
        font_name: Optional font name from fonts/ folder
        line_spacing: Additional spacing between lines in pixels
        
    Returns:
        Optimal font for the text
    """
    # Compute theoretical optimal size based on text proportions
    # Start with a baseline font to measure proportions
    baseline_size = 100.0
    baseline_font = get_fixed_font(baseline_size, font_name)

    # Find the longest line to determine width constraint
    longest_line = max(lines, key=len) if lines else ""

    # Measure baseline dimensions
    bbox = draw.textbbox((0, 0), longest_line, font=baseline_font)
    baseline_width = bbox[2] - bbox[0]
    baseline_line_height = bbox[3] - bbox[1]

    # Calculate total height with line spacing
    total_baseline_height = baseline_line_height * len(lines)
    if len(lines) > 1:
        total_baseline_height += line_spacing * (len(lines) - 1)

    # Calculate theoretical optimal size based on proportions
    width_ratio = max_width / baseline_width if baseline_width > 0 else 1.0
    height_ratio = max_height / total_baseline_height if total_baseline_height > 0 else 1.0
    theoretical_size = baseline_size * min(width_ratio, height_ratio)

    # Clamp to reasonable range
    theoretical_size = max(1.0, min(theoretical_size, min(max_height, max_width)))

    _LOGGER.debug("Theoretical optimal size: %.1f (width_ratio: %.2f, height_ratio: %.2f)",
                 theoretical_size, width_ratio, height_ratio)

    # Try sizes around the theoretical optimal with fine increments
    best_font = None
    best_size = 0.0

    # Test 3 iterations with refinement
    test_ranges = [
        (theoretical_size * 0.7, theoretical_size * 1.3, 2.0),  # Coarse: ±30% with 2.0 step
        (best_size - 2.0, best_size + 2.0, 0.5),                # Medium: ±2 with 0.5 step
        (best_size - 0.5, best_size + 0.5, 0.1),                # Fine: ±0.5 with 0.1 step
    ]

    for iteration, (start, end, step) in enumerate(test_ranges):
        if iteration > 0 and best_size == 0:
            break  # Skip refinement if no valid size found

        current_start = max(1.0, start if iteration == 0 else start)
        current_end = min(min(max_height, max_width), end if iteration == 0 else end)

        size = current_start
        while size <= current_end:
            try:
                # Try to load font at this size
                font = None
                if font_name:
                    font_path = get_font_path(font_name)
                    if font_path:
                        try:
                            font = ImageFont.truetype(str(font_path), size)
                        except Exception as e:
                            _LOGGER.debug("Custom font %s failed at size %.1f: %s", font_name, size, e)

                # Use default font if custom font failed or not specified
                if font is None:
                    font = ImageFont.load_default()

                # Check if all lines fit within dimensions
                fits = True
                total_height = 0

                for line in lines:
                    bbox = draw.textbbox((0, 0), line, font=font)
                    text_width = bbox[2] - bbox[0]
                    text_height = bbox[3] - bbox[1]

                    # Check if line fits horizontally
                    if text_width > max_width:
                        fits = False
                        break

                    total_height += text_height

                # Add line spacing to total height
                if len(lines) > 1:
                    total_height += line_spacing * (len(lines) - 1)

                # Check if all lines fit vertically
                if total_height > max_height:
                    fits = False

                if fits and size > best_size:
                    best_size = size
                    best_font = font
                    _LOGGER.debug("Iteration %d: Found better size: %.1f (total height: %d/%d)",
                                iteration + 1, size, total_height, max_height)

            except Exception as e:
                _LOGGER.debug("Font size %.1f failed: %s", size, e)

            size += step

    # Return best font found
    if best_font:
        _LOGGER.debug("Using optimal font size: %.1f", best_size)
        return best_font

    # Fallback to minimum font size
    _LOGGER.warning("Using fallback font - text may not fit optimally")
    return get_fixed_font(1.0, font_name)


def render_text_variable_width(
    text: str,
    width: int,
    height: int,
    font_name: str | None = None,
    text_color: str = "ffffff",
    bg_color: str = "000000",
    use_cache: bool = True
) -> bytes:
    """Render text with variable character widths using font cache.

    This function renders each character individually with its natural width,
    providing better visual appearance for proportional fonts.

    Args:
        text: Text to render (single line recommended)
        width: Display width in pixels
        height: Display height in pixels
        font_name: Font name from fonts/ folder, or None for default
        text_color: Foreground/text color in hex format (e.g., 'ffffff')
        bg_color: Background color in hex format (e.g., '000000')
        use_cache: Whether to use the font cache for character images

    Returns:
        PNG image data as bytes
    """
    # Determine font path
    font_path = get_font_path(font_name) if font_name else None
    font_path_str = str(font_path) if font_path else None

    # Parse colors
    try:
        bg_r, bg_g, bg_b = hex_to_rgb(bg_color)
        text_r, text_g, text_b = hex_to_rgb(text_color)
    except (ValueError, IndexError):
        _LOGGER.error("Invalid color format. Using defaults")
        bg_r, bg_g, bg_b = 0, 0, 0
        text_r, text_g, text_b = 255, 255, 255

    # Create output image
    output_img = Image.new('RGB', (width, height), (bg_r, bg_g, bg_b))

    if not text:
        # Return empty image
        png_buffer = io.BytesIO()
        output_img.save(png_buffer, format='PNG')
        return png_buffer.getvalue()

    # Get font cache
    cache = get_font_cache() if use_cache else None

    # Collect character images and widths
    char_images: list[tuple[Image.Image, int]] = []
    total_width = 0

    for char in text:
        if cache and font_path_str:
            # Use cache for character rendering
            char_img, char_width = cache.get_char_image(
                char=char,
                font_path=font_path_str,
                height=height,
                text_color=text_color,
                bg_color=bg_color,
                antialias=True
            )
        else:
            # Render character directly
            char_img, char_width = _render_single_char(
                char=char,
                font_path=font_path_str,
                height=height,
                text_color=(text_r, text_g, text_b),
                bg_color=(bg_r, bg_g, bg_b)
            )

        char_images.append((char_img, char_width))
        total_width += char_width

    # Calculate starting position for centered text
    x_offset = max(0, (width - total_width) // 2)

    # Composite characters onto output image
    for char_img, char_width in char_images:
        if x_offset + char_width > width:
            # Text would overflow, stop here
            break

        # Paste character image
        output_img.paste(char_img, (x_offset, 0))
        x_offset += char_width

    # Convert to PNG bytes
    png_buffer = io.BytesIO()
    output_img.save(png_buffer, format='PNG')
    return png_buffer.getvalue()


def _render_single_char(
    char: str,
    font_path: str | None,
    height: int,
    text_color: tuple[int, int, int],
    bg_color: tuple[int, int, int]
) -> tuple[Image.Image, int]:
    """Render a single character and return image with actual width.

    Args:
        char: Single character to render
        font_path: Path to font file or None for default
        height: Character height in pixels
        text_color: RGB tuple for text color
        bg_color: RGB tuple for background color

    Returns:
        Tuple of (character image, actual width)
    """
    # Load font
    try:
        if font_path:
            font = ImageFont.truetype(font_path, height)
        else:
            font = ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()

    # Create temporary image to measure character
    temp_img = Image.new('RGB', (height * 2, height), bg_color)
    temp_draw = ImageDraw.Draw(temp_img)

    # Get character bounding box
    bbox = temp_draw.textbbox((0, 0), char, font=font)
    char_width = max(1, bbox[2] - bbox[0])
    char_height = bbox[3] - bbox[1]

    # Create character image with exact width
    char_img = Image.new('RGB', (char_width, height), bg_color)
    char_draw = ImageDraw.Draw(char_img)

    # Center vertically
    y_offset = (height - char_height) // 2 - bbox[1]

    # Draw character
    char_draw.text((-bbox[0], y_offset), char, font=font, fill=text_color)

    return char_img, char_width


def clear_font_cache() -> None:
    """Clear the font cache."""
    cache = get_font_cache()
    cache.clear_cache()
    _LOGGER.info("Font cache cleared")
