/**
 * Canvas-based font renderer matching pypixelcolor output
 * Uses the same TTF fonts and rendering metrics as the device
 */

// Font metrics from pypixelcolor JSON files
// These match the JSON metadata in pypixelcolor/fonts/*.json
const FONT_METRICS = {
  'VCR_OSD_MONO': {
    16: { font_size: 16, offset: [0, 0], pixel_threshold: 70, var_width: true },
    24: { font_size: 24, offset: [0, 0], pixel_threshold: 70, var_width: true },
    32: { font_size: 28, offset: [-1, 2], pixel_threshold: 30, var_width: false }
  },
  'CUSONG': {
    16: { font_size: 16, offset: [0, -1], pixel_threshold: 70, var_width: false },
    24: { font_size: 24, offset: [0, 0], pixel_threshold: 70, var_width: false },
    32: { font_size: 32, offset: [0, 0], pixel_threshold: 70, var_width: false }
  }
};

// Font loading state
const fontLoadState = {};
const fontLoadPromises = {};

/**
 * Get the base URL for font files
 * Handles both HACS (/hacsfiles/) and manual (/local/) installation paths
 */
function getFontUrl(fontName) {
  // Try HACS path first (most common)
  return `/hacsfiles/ipixel_color/fonts/${fontName}.ttf`;
}

/**
 * Load TTF font as @font-face
 * @param {string} fontName - Name of the font to load (VCR_OSD_MONO, CUSONG)
 * @returns {Promise<boolean>} - True if font loaded successfully
 */
export async function loadFont(fontName) {
  // Return cached result if already loaded
  if (fontLoadState[fontName] === true) return true;
  if (fontLoadState[fontName] === false) return false;

  // Return existing promise if loading in progress
  if (fontLoadPromises[fontName]) return fontLoadPromises[fontName];

  // Start loading
  fontLoadPromises[fontName] = (async () => {
    const fontUrl = getFontUrl(fontName);

    try {
      const font = new FontFace(fontName, `url(${fontUrl})`);
      const loadedFont = await font.load();
      document.fonts.add(loadedFont);
      fontLoadState[fontName] = true;
      console.log(`iPIXEL: Font ${fontName} loaded successfully`);
      return true;
    } catch (e) {
      console.warn(`iPIXEL: Failed to load font ${fontName}:`, e);
      fontLoadState[fontName] = false;
      return false;
    }
  })();

  return fontLoadPromises[fontName];
}

/**
 * Check if a font is loaded
 * @param {string} fontName - Name of the font to check
 * @returns {boolean} - True if font is loaded
 */
export function isFontLoaded(fontName) {
  return fontLoadState[fontName] === true;
}

/**
 * Get closest height key for font metrics (16, 24, or 32)
 * @param {number} height - Display height in pixels
 * @returns {number} - Closest metrics key
 */
function getHeightKey(height) {
  if (height <= 18) return 16;
  if (height <= 28) return 24;
  return 32;
}

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color string (e.g., '#ff6600')
 * @returns {{r: number, g: number, b: number}} - RGB object
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Render text to pixels using Canvas (matches pypixelcolor output)
 * @param {string} text - Text to render
 * @param {number} width - Display width in pixels
 * @param {number} height - Display height in pixels
 * @param {string} fgColor - Foreground color (hex)
 * @param {string} bgColor - Background color (hex)
 * @param {string} fontName - Font name (VCR_OSD_MONO, CUSONG)
 * @returns {string[]|null} - Array of hex color strings, or null if font not available
 */
export function textToPixelsCanvas(text, width, height, fgColor = '#ff6600', bgColor = '#111', fontName = 'VCR_OSD_MONO') {
  // Check if font metrics exist
  const fontMetrics = FONT_METRICS[fontName];
  if (!fontMetrics) {
    console.warn(`iPIXEL: Unknown font: ${fontName}`);
    return null;
  }

  // Check if font is loaded
  if (!isFontLoaded(fontName)) {
    // Try to load it (non-blocking, will return null this time)
    loadFont(fontName);
    return null;
  }

  // Get metrics for this height
  const heightKey = getHeightKey(height);
  const metrics = fontMetrics[heightKey];

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Disable anti-aliasing for crisp pixel rendering
  ctx.imageSmoothingEnabled = false;

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Handle empty text
  if (!text || text.trim() === '') {
    const pixels = [];
    for (let i = 0; i < width * height; i++) {
      pixels.push(bgColor);
    }
    return pixels;
  }

  // Set font
  ctx.font = `${metrics.font_size}px "${fontName}"`;
  ctx.fillStyle = fgColor;
  ctx.textBaseline = 'top';

  // Measure text for centering
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;

  // Center text with offset from metrics
  const x = Math.floor((width - textWidth) / 2) + metrics.offset[0];
  const y = Math.floor((height - metrics.font_size) / 2) + metrics.offset[1];

  // Draw text
  ctx.fillText(text, x, y);

  // Extract pixels with threshold
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = [];

  // Parse foreground and background colors
  const fg = hexToRgb(fgColor);
  const bg = hexToRgb(bgColor);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    // Convert to grayscale and apply threshold
    // pypixelcolor uses simple average: (r + g + b) / 3
    const gray = (r + g + b) / 3;

    if (gray >= metrics.pixel_threshold) {
      pixels.push(fgColor);
    } else {
      pixels.push(bgColor);
    }
  }

  return pixels;
}

/**
 * Render text for scrolling (extended width for seamless loop)
 * @param {string} text - Text to render
 * @param {number} displayWidth - Display width in pixels
 * @param {number} height - Display height in pixels
 * @param {string} fgColor - Foreground color (hex)
 * @param {string} bgColor - Background color (hex)
 * @param {string} fontName - Font name
 * @returns {{pixels: string[], width: number}|null} - Extended pixel array and width, or null
 */
export function textToScrollPixelsCanvas(text, displayWidth, height, fgColor = '#ff6600', bgColor = '#111', fontName = 'VCR_OSD_MONO') {
  // Check if font metrics exist
  const fontMetrics = FONT_METRICS[fontName];
  if (!fontMetrics) {
    return null;
  }

  // Check if font is loaded
  if (!isFontLoaded(fontName)) {
    loadFont(fontName);
    return null;
  }

  // Get metrics for this height
  const heightKey = getHeightKey(height);
  const metrics = fontMetrics[heightKey];

  // Create temporary canvas to measure text width
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = `${metrics.font_size}px "${fontName}"`;
  const textWidth = Math.ceil(tempCtx.measureText(text).width);

  // Extended width: display + text + display (for seamless loop)
  const extendedWidth = displayWidth + textWidth + displayWidth;

  // Create canvas with extended width
  const canvas = document.createElement('canvas');
  canvas.width = extendedWidth;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, extendedWidth, height);

  // Handle empty text
  if (!text || text.trim() === '') {
    const pixels = [];
    for (let i = 0; i < extendedWidth * height; i++) {
      pixels.push(bgColor);
    }
    return { pixels, width: extendedWidth };
  }

  // Set font
  ctx.font = `${metrics.font_size}px "${fontName}"`;
  ctx.fillStyle = fgColor;
  ctx.textBaseline = 'top';

  // Draw text starting after one display width of padding
  const x = displayWidth + metrics.offset[0];
  const y = Math.floor((height - metrics.font_size) / 2) + metrics.offset[1];
  ctx.fillText(text, x, y);

  // Extract pixels with threshold
  const imageData = ctx.getImageData(0, 0, extendedWidth, height);
  const pixels = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    const gray = (r + g + b) / 3;

    if (gray >= metrics.pixel_threshold) {
      pixels.push(fgColor);
    } else {
      pixels.push(bgColor);
    }
  }

  return { pixels, width: extendedWidth };
}

/**
 * Preload all available fonts
 */
export async function preloadFonts() {
  const fonts = Object.keys(FONT_METRICS);
  await Promise.all(fonts.map(loadFont));
}

export { FONT_METRICS };
