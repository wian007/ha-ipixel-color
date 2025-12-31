/**
 * SVG Pixel Display Renderer
 * Creates animated SVG representations of the LED matrix
 */

/**
 * Create an SVG pixel display with optional animation effects
 * @param {number} width - Display width in pixels
 * @param {number} height - Display height in pixels
 * @param {string[]} pixels - Array of color values
 * @param {number} pixelGap - Gap between pixels
 * @param {string} effect - Animation effect name
 * @param {number} speed - Animation speed (1-100)
 * @returns {string} SVG markup
 */
export function createPixelSvg(width, height, pixels, pixelGap = 1, effect = 'fixed', speed = 50) {
  const svgWidth = 100;
  const pxWidth = svgWidth / width;
  const pxHeight = pxWidth;
  const svgHeight = height * pxHeight;

  // Speed mapping: 1 = slowest, 100 = fastest
  const effectDuration = 0.2 + (100 - speed) * 0.08;
  const scrollDuration = 1 + (100 - speed) * 0.15;

  let rects = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = pixels[y * width + x] || '#111';
      const isLit = color !== '#111' && color !== '#000' && color !== '#1a1a1a' && color !== '#050505';
      const delay = (x / width) * effectDuration * 0.3;

      let style = isLit ? `filter: drop-shadow(0 0 2px ${color});` : '';

      if (isLit) {
        if (effect === 'blink') {
          style += `animation: ipixel-blink ${effectDuration}s ease-in-out infinite;`;
        } else if (effect === 'breeze') {
          style += `animation: ipixel-breeze ${effectDuration * 1.5}s ease-in-out infinite; animation-delay: ${delay}s;`;
        } else if (effect === 'snow') {
          const randomDelay = Math.random() * effectDuration;
          style += `animation: ipixel-snow ${effectDuration * 2}s ease-in-out infinite; animation-delay: ${randomDelay}s;`;
        } else if (effect === 'laser') {
          style += `animation: ipixel-laser ${effectDuration}s linear infinite; animation-delay: ${delay}s;`;
        }
      }

      rects += `<rect x="${x * pxWidth}" y="${y * pxHeight}" width="${pxWidth - pixelGap * 0.1}" height="${pxHeight - pixelGap * 0.1}" fill="${color}" rx="0.3" style="${style}"/>`;
    }
  }

  // For scrolling effects, duplicate content for seamless loop
  let content = rects;
  let groupStyle = '';

  if (effect === 'scroll_ltr' || effect === 'scroll_rtl') {
    const duplicate = rects.replace(/x="(\d+\.?\d*)"/g, (_, x) => `x="${parseFloat(x) + svgWidth}"`);
    content = rects + duplicate;

    if (effect === 'scroll_ltr') {
      groupStyle = `animation: ipixel-scroll-ltr ${scrollDuration}s linear infinite;`;
    } else {
      groupStyle = `animation: ipixel-scroll-rtl ${scrollDuration}s linear infinite;`;
    }
  }

  return `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;overflow:hidden;">
      <defs>
        <clipPath id="displayClip">
          <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}"/>
        </clipPath>
        <style>
          @keyframes ipixel-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes ipixel-breeze {
            0%, 100% { opacity: 1; transform: translateX(0); }
            50% { opacity: 0.4; transform: translateX(1px); }
          }
          @keyframes ipixel-snow {
            0%, 100% { opacity: 1; }
            25% { opacity: 0.2; }
            50% { opacity: 0.8; }
            75% { opacity: 0.3; }
          }
          @keyframes ipixel-laser {
            0%, 100% { opacity: 0.2; filter: brightness(0.5); }
            50% { opacity: 1; filter: brightness(1.5); }
          }
          @keyframes ipixel-scroll-ltr {
            0% { transform: translateX(-${svgWidth}px); }
            100% { transform: translateX(0); }
          }
          @keyframes ipixel-scroll-rtl {
            0% { transform: translateX(0); }
            100% { transform: translateX(-${svgWidth}px); }
          }
        </style>
      </defs>
      <g clip-path="url(#displayClip)">
        <g style="${groupStyle}">${content}</g>
      </g>
    </svg>`;
}
