(() => {
  // src/version.js
  var CARD_VERSION = "2.11.1";

  // src/base.js
  var iPIXELCardBase = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._config = {};
      this._hass = null;
    }
    set hass(hass) {
      this._hass = hass;
      this.render();
    }
    setConfig(config) {
      if (!config.entity)
        throw new Error("Please define an entity");
      this._config = config;
      this.render();
    }
    getEntity() {
      if (!this._hass || !this._config.entity)
        return null;
      return this._hass.states[this._config.entity];
    }
    getRelatedEntity(domain, suffix = "") {
      if (!this._hass || !this._config.entity)
        return null;
      const baseName = this._config.entity.replace(/^[^.]+\./, "").replace(/_?(text|display|gif_url)$/i, "");
      const exactId = `${domain}.${baseName}${suffix}`;
      if (this._hass.states[exactId])
        return this._hass.states[exactId];
      const matches = Object.keys(this._hass.states).filter((id) => {
        if (!id.startsWith(`${domain}.`))
          return false;
        const entityName = id.replace(/^[^.]+\./, "");
        return entityName.includes(baseName) || baseName.includes(entityName.replace(suffix, ""));
      });
      if (suffix) {
        const withSuffix = matches.find((id) => id.endsWith(suffix));
        if (withSuffix)
          return this._hass.states[withSuffix];
      } else {
        const sorted = matches.sort((a2, b) => a2.length - b.length);
        if (sorted.length > 0)
          return this._hass.states[sorted[0]];
      }
      return matches.length > 0 ? this._hass.states[matches[0]] : null;
    }
    async callService(domain, service, data = {}) {
      if (!this._hass)
        return;
      try {
        await this._hass.callService(domain, service, data);
      } catch (err) {
        console.error(`iPIXEL service call failed: ${domain}.${service}`, err);
      }
    }
    getResolution() {
      const widthEntity = this.getRelatedEntity("sensor", "_width") || this._hass?.states["sensor.display_width"];
      const heightEntity = this.getRelatedEntity("sensor", "_height") || this._hass?.states["sensor.display_height"];
      if (widthEntity && heightEntity) {
        const w = parseInt(widthEntity.state), h2 = parseInt(heightEntity.state);
        if (!isNaN(w) && !isNaN(h2) && w > 0 && h2 > 0)
          return [w, h2];
      }
      return [64, 16];
    }
    isOn() {
      return this.getRelatedEntity("switch")?.state === "on";
    }
    hexToRgb(hex) {
      const r2 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return r2 ? [parseInt(r2[1], 16), parseInt(r2[2], 16), parseInt(r2[3], 16)] : [255, 255, 255];
    }
    render() {
    }
    getCardSize() {
      return 2;
    }
  };

  // src/styles.js
  var iPIXELCardStyles = `
  :host {
    --ipixel-primary: var(--primary-color, #03a9f4);
    --ipixel-accent: var(--accent-color, #ff9800);
    --ipixel-text: var(--primary-text-color, #fff);
    --ipixel-bg: var(--ha-card-background, #1c1c1c);
    --ipixel-border: var(--divider-color, #333);
  }

  .card-content { padding: 16px; }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .card-title {
    font-size: 1.1em;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4caf50;
  }
  .status-dot.off { background: #f44336; }
  .status-dot.unavailable { background: #9e9e9e; }

  .section-title {
    font-size: 0.85em;
    font-weight: 500;
    margin-bottom: 8px;
    opacity: 0.8;
  }

  .control-row { margin-bottom: 12px; }

  /* Buttons */
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85em;
    font-weight: 500;
    transition: all 0.2s;
  }
  .btn-primary { background: var(--ipixel-primary); color: #fff; }
  .btn-primary:hover { opacity: 0.9; }
  .btn-secondary {
    background: rgba(255,255,255,0.1);
    color: var(--ipixel-text);
    border: 1px solid var(--ipixel-border);
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.15); }
  .btn-danger { background: #f44336; color: #fff; }
  .btn-success { background: #4caf50; color: #fff; }

  .icon-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.1);
    border: 1px solid var(--ipixel-border);
    border-radius: 6px;
    cursor: pointer;
    color: inherit;
  }
  .icon-btn:hover { background: rgba(255,255,255,0.15); }
  .icon-btn.active {
    background: rgba(3, 169, 244, 0.3);
    border-color: var(--ipixel-primary);
  }
  .icon-btn svg { width: 20px; height: 20px; fill: currentColor; }

  /* Slider */
  .slider-row { display: flex; align-items: center; gap: 12px; }
  .slider-label { min-width: 70px; font-size: 0.85em; }
  .slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(to right,
      var(--ipixel-primary) 0%,
      var(--ipixel-primary) var(--value, 50%),
      rgba(255,255,255,0.25) var(--value, 50%),
      rgba(255,255,255,0.25) 100%);
    outline: none;
    cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid var(--ipixel-primary);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid var(--ipixel-primary);
    cursor: pointer;
  }
  .slider-value { min-width: 40px; text-align: right; font-size: 0.85em; font-weight: 500; }

  /* Dropdown */
  .dropdown {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--ipixel-border);
    border-radius: 6px;
    color: inherit;
    font-size: 0.9em;
    cursor: pointer;
  }

  /* Input */
  .text-input {
    width: 100%;
    padding: 10px 12px;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--ipixel-border);
    border-radius: 6px;
    color: inherit;
    font-size: 0.9em;
    box-sizing: border-box;
  }
  .text-input:focus { outline: none; border-color: var(--ipixel-primary); }

  /* Button Grid */
  .button-grid { display: grid; gap: 8px; }
  .button-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .button-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .button-grid-2 { grid-template-columns: repeat(2, 1fr); }

  /* Mode buttons */
  .mode-btn {
    padding: 10px 8px;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--ipixel-border);
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    font-size: 0.8em;
    color: inherit;
    transition: all 0.2s;
  }
  .mode-btn:hover { background: rgba(255,255,255,0.12); }
  .mode-btn.active { background: rgba(3, 169, 244, 0.25); border-color: var(--ipixel-primary); }

  /* Color picker */
  .color-row { display: flex; align-items: center; gap: 12px; }
  .color-picker {
    width: 40px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--ipixel-border);
    border-radius: 4px;
    cursor: pointer;
    background: none;
  }

  /* List items */
  .list-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: rgba(255,255,255,0.05);
    border-radius: 6px;
    margin-bottom: 8px;
    gap: 12px;
  }
  .list-item:last-child { margin-bottom: 0; }
  .list-item-info { flex: 1; }
  .list-item-name { font-weight: 500; font-size: 0.9em; }
  .list-item-meta { font-size: 0.75em; opacity: 0.6; margin-top: 2px; }
  .list-item-actions { display: flex; gap: 4px; }

  /* Empty state */
  .empty-state { text-align: center; padding: 24px; opacity: 0.6; font-size: 0.9em; }

  @media (max-width: 400px) {
    .button-grid-4 { grid-template-columns: repeat(2, 1fr); }
  }
`;

  // src/font.js
  var pixelFont = {
    // Uppercase letters (full height)
    "A": [124, 18, 17, 18, 124],
    "B": [127, 73, 73, 73, 54],
    "C": [62, 65, 65, 65, 34],
    "D": [127, 65, 65, 34, 28],
    "E": [127, 73, 73, 73, 65],
    "F": [127, 9, 9, 9, 1],
    "G": [62, 65, 73, 73, 122],
    "H": [127, 8, 8, 8, 127],
    "I": [0, 65, 127, 65, 0],
    "J": [32, 64, 65, 63, 1],
    "K": [127, 8, 20, 34, 65],
    "L": [127, 64, 64, 64, 64],
    "M": [127, 2, 12, 2, 127],
    "N": [127, 4, 8, 16, 127],
    "O": [62, 65, 65, 65, 62],
    "P": [127, 9, 9, 9, 6],
    "Q": [62, 65, 81, 33, 94],
    "R": [127, 9, 25, 41, 70],
    "S": [70, 73, 73, 73, 49],
    "T": [1, 1, 127, 1, 1],
    "U": [63, 64, 64, 64, 63],
    "V": [31, 32, 64, 32, 31],
    "W": [63, 64, 56, 64, 63],
    "X": [99, 20, 8, 20, 99],
    "Y": [7, 8, 112, 8, 7],
    "Z": [97, 81, 73, 69, 67],
    // Lowercase letters (smaller x-height, with ascenders/descenders)
    "a": [32, 84, 84, 84, 120],
    "b": [127, 72, 68, 68, 56],
    "c": [56, 68, 68, 68, 32],
    "d": [56, 68, 68, 72, 127],
    "e": [56, 84, 84, 84, 24],
    "f": [8, 126, 9, 1, 2],
    "g": [12, 82, 82, 82, 62],
    "h": [127, 8, 4, 4, 120],
    "i": [0, 68, 125, 64, 0],
    "j": [32, 64, 68, 61, 0],
    "k": [127, 16, 40, 68, 0],
    "l": [0, 65, 127, 64, 0],
    "m": [124, 4, 24, 4, 120],
    "n": [124, 8, 4, 4, 120],
    "o": [56, 68, 68, 68, 56],
    "p": [124, 20, 20, 20, 8],
    "q": [8, 20, 20, 24, 124],
    "r": [124, 8, 4, 4, 8],
    "s": [72, 84, 84, 84, 32],
    "t": [4, 63, 68, 64, 32],
    "u": [60, 64, 64, 32, 124],
    "v": [28, 32, 64, 32, 28],
    "w": [60, 64, 48, 64, 60],
    "x": [68, 40, 16, 40, 68],
    "y": [12, 80, 80, 80, 60],
    "z": [68, 100, 84, 76, 68],
    // Numbers
    "0": [62, 81, 73, 69, 62],
    "1": [0, 66, 127, 64, 0],
    "2": [66, 97, 81, 73, 70],
    "3": [33, 65, 69, 75, 49],
    "4": [24, 20, 18, 127, 16],
    "5": [39, 69, 69, 69, 57],
    "6": [60, 74, 73, 73, 48],
    "7": [1, 113, 9, 5, 3],
    "8": [54, 73, 73, 73, 54],
    "9": [6, 73, 73, 41, 30],
    // Punctuation & symbols
    " ": [0, 0, 0, 0, 0],
    ".": [0, 96, 96, 0, 0],
    ",": [0, 128, 96, 0, 0],
    ":": [0, 54, 54, 0, 0],
    ";": [0, 128, 54, 0, 0],
    "!": [0, 0, 95, 0, 0],
    "?": [2, 1, 81, 9, 6],
    "-": [8, 8, 8, 8, 8],
    "+": [8, 8, 62, 8, 8],
    "=": [20, 20, 20, 20, 20],
    "_": [64, 64, 64, 64, 64],
    "/": [32, 16, 8, 4, 2],
    "\\": [2, 4, 8, 16, 32],
    "(": [0, 28, 34, 65, 0],
    ")": [0, 65, 34, 28, 0],
    "[": [0, 127, 65, 65, 0],
    "]": [0, 65, 65, 127, 0],
    "<": [8, 20, 34, 65, 0],
    ">": [0, 65, 34, 20, 8],
    "*": [20, 8, 62, 8, 20],
    "#": [20, 127, 20, 127, 20],
    "@": [62, 65, 93, 85, 30],
    "&": [54, 73, 85, 34, 80],
    "%": [35, 19, 8, 100, 98],
    "$": [18, 42, 127, 42, 36],
    "'": [0, 0, 7, 0, 0],
    '"': [0, 7, 0, 7, 0],
    "`": [0, 1, 2, 0, 0],
    "^": [4, 2, 1, 2, 4],
    "~": [8, 4, 8, 16, 8]
  };
  function textToPixels(text, width, height, fgColor = "#ff6600", bgColor = "#111") {
    const pixels = [];
    const charWidth = 6;
    const charHeight = 7;
    const startY = Math.floor((height - charHeight) / 2);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        pixels.push(bgColor);
      }
    }
    const textWidth = text.length * charWidth - 1;
    const startX = Math.max(1, Math.floor((width - textWidth) / 2));
    let xOffset = startX;
    for (const char of text) {
      const charData = pixelFont[char] || pixelFont[" "];
      for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 7; row++) {
          const pixelOn = charData[col] >> row & 1;
          const px = xOffset + col;
          const py = startY + row;
          if (px >= 0 && px < width && py < height && py >= 0) {
            pixels[py * width + px] = pixelOn ? fgColor : bgColor;
          }
        }
      }
      xOffset += charWidth;
    }
    return pixels;
  }
  function textToScrollPixels(text, displayWidth, height, fgColor = "#ff6600", bgColor = "#111") {
    const charWidth = 6;
    const charHeight = 7;
    const startY = Math.floor((height - charHeight) / 2);
    const textPixelWidth = text.length * charWidth;
    const extendedWidth = displayWidth + textPixelWidth + displayWidth;
    const pixels = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < extendedWidth; x++) {
        pixels.push(bgColor);
      }
    }
    let xOffset = displayWidth;
    for (const char of text) {
      const charData = pixelFont[char] || pixelFont[" "];
      for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 7; row++) {
          const pixelOn = charData[col] >> row & 1;
          const px = xOffset + col;
          const py = startY + row;
          if (px >= 0 && px < extendedWidth && py < height && py >= 0) {
            pixels[py * extendedWidth + px] = pixelOn ? fgColor : bgColor;
          }
        }
      }
      xOffset += charWidth;
    }
    return { pixels, width: extendedWidth };
  }

  // src/canvas-font.js
  var FONT_METRICS = {
    "VCR_OSD_MONO": {
      16: { font_size: 16, offset: [0, 0], pixel_threshold: 70, var_width: true },
      24: { font_size: 24, offset: [0, 0], pixel_threshold: 70, var_width: true },
      32: { font_size: 28, offset: [-1, 2], pixel_threshold: 30, var_width: false }
    },
    "CUSONG": {
      16: { font_size: 16, offset: [0, -1], pixel_threshold: 70, var_width: false },
      24: { font_size: 24, offset: [0, 0], pixel_threshold: 70, var_width: false },
      32: { font_size: 32, offset: [0, 0], pixel_threshold: 70, var_width: false }
    }
  };
  var fontLoadState = {};
  var fontLoadPromises = {};
  function getFontUrl(fontName) {
    const isHomeAssistant = typeof window.hassConnection !== "undefined" || window.location.pathname.includes("/lovelace") || window.location.pathname.includes("/dashboard") || document.querySelector("home-assistant") !== null;
    if (isHomeAssistant) {
      return `/hacsfiles/ipixel_color/fonts/${fontName}.ttf`;
    }
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1);
    return `${basePath}fonts/${fontName}.ttf`;
  }
  async function loadFont(fontName) {
    if (fontLoadState[fontName] === true)
      return true;
    if (fontLoadState[fontName] === false)
      return false;
    if (fontLoadPromises[fontName])
      return fontLoadPromises[fontName];
    fontLoadPromises[fontName] = (async () => {
      const fontUrl = getFontUrl(fontName);
      try {
        const font = new FontFace(fontName, `url(${fontUrl})`);
        const loadedFont = await font.load();
        document.fonts.add(loadedFont);
        fontLoadState[fontName] = true;
        console.log(`iPIXEL: Font ${fontName} loaded successfully`);
        return true;
      } catch (e2) {
        console.warn(`iPIXEL: Failed to load font ${fontName}:`, e2);
        fontLoadState[fontName] = false;
        return false;
      }
    })();
    return fontLoadPromises[fontName];
  }
  function isFontLoaded(fontName) {
    return fontLoadState[fontName] === true;
  }
  function getHeightKey(height) {
    if (height <= 18)
      return 16;
    if (height <= 28)
      return 24;
    return 32;
  }
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
  function textToPixelsCanvas(text, width, height, fgColor = "#ff6600", bgColor = "#111", fontName = "VCR_OSD_MONO") {
    const fontMetrics = FONT_METRICS[fontName];
    if (!fontMetrics) {
      console.warn(`iPIXEL: Unknown font: ${fontName}`);
      return null;
    }
    if (!isFontLoaded(fontName)) {
      loadFont(fontName);
      return null;
    }
    const heightKey = getHeightKey(height);
    const metrics = fontMetrics[heightKey];
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    if (!text || text.trim() === "") {
      const pixels2 = [];
      for (let i2 = 0; i2 < width * height; i2++) {
        pixels2.push(bgColor);
      }
      return pixels2;
    }
    ctx.font = `${metrics.font_size}px "${fontName}"`;
    ctx.fillStyle = fgColor;
    ctx.textBaseline = "top";
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const x = Math.floor((width - textWidth) / 2) + metrics.offset[0];
    const y = Math.floor((height - metrics.font_size) / 2) + metrics.offset[1];
    ctx.fillText(text, x, y);
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = [];
    const fg = hexToRgb(fgColor);
    const bg = hexToRgb(bgColor);
    for (let i2 = 0; i2 < imageData.data.length; i2 += 4) {
      const r2 = imageData.data[i2];
      const g = imageData.data[i2 + 1];
      const b = imageData.data[i2 + 2];
      const gray = (r2 + g + b) / 3;
      if (gray >= metrics.pixel_threshold) {
        pixels.push(fgColor);
      } else {
        pixels.push(bgColor);
      }
    }
    return pixels;
  }
  function textToScrollPixelsCanvas(text, displayWidth, height, fgColor = "#ff6600", bgColor = "#111", fontName = "VCR_OSD_MONO") {
    const fontMetrics = FONT_METRICS[fontName];
    if (!fontMetrics) {
      return null;
    }
    if (!isFontLoaded(fontName)) {
      loadFont(fontName);
      return null;
    }
    const heightKey = getHeightKey(height);
    const metrics = fontMetrics[heightKey];
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.font = `${metrics.font_size}px "${fontName}"`;
    const textWidth = Math.ceil(tempCtx.measureText(text).width);
    const extendedWidth = displayWidth + textWidth + displayWidth;
    const canvas = document.createElement("canvas");
    canvas.width = extendedWidth;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, extendedWidth, height);
    if (!text || text.trim() === "") {
      const pixels2 = [];
      for (let i2 = 0; i2 < extendedWidth * height; i2++) {
        pixels2.push(bgColor);
      }
      return { pixels: pixels2, width: extendedWidth };
    }
    ctx.font = `${metrics.font_size}px "${fontName}"`;
    ctx.fillStyle = fgColor;
    ctx.textBaseline = "top";
    const x = displayWidth + metrics.offset[0];
    const y = Math.floor((height - metrics.font_size) / 2) + metrics.offset[1];
    ctx.fillText(text, x, y);
    const imageData = ctx.getImageData(0, 0, extendedWidth, height);
    const pixels = [];
    for (let i2 = 0; i2 < imageData.data.length; i2 += 4) {
      const r2 = imageData.data[i2];
      const g = imageData.data[i2 + 1];
      const b = imageData.data[i2 + 2];
      const gray = (r2 + g + b) / 3;
      if (gray >= metrics.pixel_threshold) {
        pixels.push(fgColor);
      } else {
        pixels.push(bgColor);
      }
    }
    return { pixels, width: extendedWidth };
  }

  // lib/bdfparser.bundle.js
  var fetchline_e = function(e2, n2, t2, r2) {
    return new (t2 || (t2 = Promise))(function(o2, i2) {
      function c(e3) {
        try {
          l2(r2.next(e3));
        } catch (e4) {
          i2(e4);
        }
      }
      function u(e3) {
        try {
          l2(r2.throw(e3));
        } catch (e4) {
          i2(e4);
        }
      }
      function l2(e3) {
        var n3;
        e3.done ? o2(e3.value) : (n3 = e3.value, n3 instanceof t2 ? n3 : new t2(function(e4) {
          e4(n3);
        })).then(c, u);
      }
      l2((r2 = r2.apply(e2, n2 || [])).next());
    });
  };
  var fetchline_n = function(e2) {
    return this instanceof fetchline_n ? (this.v = e2, this) : new fetchline_n(e2);
  };
  var fetchline_t = function(e2, t2, r2) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var o2, i2 = r2.apply(e2, t2 || []), c = [];
    return o2 = {}, u("next"), u("throw"), u("return"), o2[Symbol.asyncIterator] = function() {
      return this;
    }, o2;
    function u(e3) {
      i2[e3] && (o2[e3] = function(n2) {
        return new Promise(function(t3, r3) {
          c.push([e3, n2, t3, r3]) > 1 || l2(e3, n2);
        });
      });
    }
    function l2(e3, t3) {
      try {
        (r3 = i2[e3](t3)).value instanceof fetchline_n ? Promise.resolve(r3.value.v).then(s2, a2) : f(c[0][2], r3);
      } catch (e4) {
        f(c[0][3], e4);
      }
      var r3;
    }
    function s2(e3) {
      l2("next", e3);
    }
    function a2(e3) {
      l2("throw", e3);
    }
    function f(e3, n2) {
      e3(n2), c.shift(), c.length && l2(c[0][0], c[0][1]);
    }
  };
  function $fetchline(r2, { includeLastEmptyLine: o2 = true, encoding: i2 = "utf-8", delimiter: c = /\r?\n/g } = {}) {
    return fetchline_t(this, arguments, function* () {
      const t2 = yield fetchline_n(((n2) => fetchline_e(void 0, void 0, void 0, function* () {
        const e2 = yield fetch(n2);
        if (null === e2.body)
          throw new Error("Cannot read file");
        return e2.body.getReader();
      }))(r2));
      let { value: u, done: l2 } = yield fetchline_n(t2.read());
      const s2 = new TextDecoder(i2);
      let a2, f = u ? s2.decode(u) : "";
      if ("string" == typeof c) {
        if ("" === c)
          throw new Error("delimiter cannot be empty string!");
        a2 = new RegExp(c.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"), "g");
      } else
        a2 = false === /g/.test(c.flags) ? new RegExp(c.source, c.flags + "g") : c;
      let d = 0;
      for (; ; ) {
        const e2 = a2.exec(f);
        if (null !== e2)
          yield yield fetchline_n(f.substring(d, e2.index)), d = a2.lastIndex;
        else {
          if (true === l2)
            break;
          const e3 = f.substring(d);
          ({ value: u, done: l2 } = yield fetchline_n(t2.read())), f = e3 + (f ? s2.decode(u) : ""), d = 0;
        }
      }
      (o2 || d < f.length) && (yield yield fetchline_n(f.substring(d)));
    });
  }
  var t = function(t2, e2, n2, r2) {
    return new (n2 || (n2 = Promise))(function(i2, s2) {
      function a2(t3) {
        try {
          l2(r2.next(t3));
        } catch (t4) {
          s2(t4);
        }
      }
      function o2(t3) {
        try {
          l2(r2.throw(t3));
        } catch (t4) {
          s2(t4);
        }
      }
      function l2(t3) {
        var e3;
        t3.done ? i2(t3.value) : (e3 = t3.value, e3 instanceof n2 ? e3 : new n2(function(t4) {
          t4(e3);
        })).then(a2, o2);
      }
      l2((r2 = r2.apply(t2, e2 || [])).next());
    });
  };
  var e = function(t2) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var e2, n2 = t2[Symbol.asyncIterator];
    return n2 ? n2.call(t2) : (t2 = "function" == typeof __values ? __values(t2) : t2[Symbol.iterator](), e2 = {}, r2("next"), r2("throw"), r2("return"), e2[Symbol.asyncIterator] = function() {
      return this;
    }, e2);
    function r2(n3) {
      e2[n3] = t2[n3] && function(e3) {
        return new Promise(function(r3, i2) {
          (function(t3, e4, n4, r4) {
            Promise.resolve(r4).then(function(e5) {
              t3({ value: e5, done: n4 });
            }, e4);
          })(r3, i2, (e3 = t2[n3](e3)).done, e3.value);
        });
      };
    }
  };
  var n = "[\\s]+";
  var r = { glyphname: "empty", codepoint: 8203, bbw: 0, bbh: 0, bbxoff: 0, bbyoff: 0, swx0: 0, swy0: 0, dwx0: 0, dwy0: 0, swx1: 0, swy1: 0, dwx1: 0, dwy1: 0, vvectorx: 0, vvectory: 0, hexdata: [] };
  var i = ["glyphname", "codepoint", "bbw", "bbh", "bbxoff", "bbyoff", "swx0", "swy0", "dwx0", "dwy0", "swx1", "swy1", "dwx1", "dwy1", "vvectorx", "vvectory", "hexdata"];
  var s = { lr: "lrtb", rl: "rltb", tb: "tbrl", bt: "btrl", lrtb: void 0, lrbt: void 0, rltb: void 0, rlbt: void 0, tbrl: void 0, tblr: void 0, btrl: void 0, btlr: void 0 };
  var a = { lr: 1, rl: 2, tb: 0, bt: -1 };
  var o = class {
    constructor() {
      this.headers = void 0, this.__headers = {}, this.props = {}, this.glyphs = /* @__PURE__ */ new Map(), this.__glyph_count_to_check = null, this.__curline_startchar = null, this.__curline_chars = null;
    }
    load_filelines(n2) {
      var r2, i2;
      return t(this, void 0, void 0, function* () {
        try {
          this.__f = n2, yield this.__parse_headers();
        } finally {
          if ("undefined" != typeof Deno && void 0 !== this.__f)
            try {
              for (var t2, s2 = e(this.__f); !(t2 = yield s2.next()).done; ) {
                t2.value;
              }
            } catch (t3) {
              r2 = { error: t3 };
            } finally {
              try {
                t2 && !t2.done && (i2 = s2.return) && (yield i2.call(s2));
              } finally {
                if (r2)
                  throw r2.error;
              }
            }
        }
        return this;
      });
    }
    __parse_headers() {
      var e2, r2;
      return t(this, void 0, void 0, function* () {
        for (; ; ) {
          const t2 = null === (r2 = yield null === (e2 = this.__f) || void 0 === e2 ? void 0 : e2.next()) || void 0 === r2 ? void 0 : r2.value, i2 = t2.split(/ (.+)/, 2), s2 = i2.length;
          let a2;
          if (2 === s2) {
            const e3 = i2[0], r3 = i2[1].trim();
            switch (e3) {
              case "STARTFONT":
                this.__headers.bdfversion = parseFloat(r3);
                break;
              case "FONT":
                this.__headers.fontname = r3;
                break;
              case "SIZE":
                a2 = r3.split(" "), this.__headers.pointsize = parseInt(a2[0], 10), this.__headers.xres = parseInt(a2[1], 10), this.__headers.yres = parseInt(a2[2], 10);
                break;
              case "FONTBOUNDINGBOX":
                a2 = r3.split(" "), this.__headers.fbbx = parseInt(a2[0], 10), this.__headers.fbby = parseInt(a2[1], 10), this.__headers.fbbxoff = parseInt(a2[2], 10), this.__headers.fbbyoff = parseInt(a2[3], 10);
                break;
              case "STARTPROPERTIES":
                return this.__parse_headers_after(), void (yield this.__parse_props());
              case "COMMENT":
                "comment" in this.__headers && Array.isArray(this.__headers.comment) || (this.__headers.comment = []), this.__headers.comment.push(r3.replace(/^[\s"'\t\r\n]+|[\s"'\t\r\n]+$/g, ""));
                break;
              case "SWIDTH":
                a2 = r3.split(" "), this.__headers.swx0 = parseInt(a2[0], 10), this.__headers.swy0 = parseInt(a2[1], 10);
                break;
              case "DWIDTH":
                a2 = r3.split(" "), this.__headers.dwx0 = parseInt(a2[0], 10), this.__headers.dwy0 = parseInt(a2[1], 10);
                break;
              case "SWIDTH1":
                a2 = r3.split(" "), this.__headers.swx1 = parseInt(a2[0], 10), this.__headers.swy1 = parseInt(a2[1], 10);
                break;
              case "DWIDTH1":
                a2 = r3.split(" "), this.__headers.dwx1 = parseInt(a2[0], 10), this.__headers.dwy1 = parseInt(a2[1], 10);
                break;
              case "VVECTOR":
                a2 = n.split(r3), this.__headers.vvectorx = parseInt(a2[0], 10), this.__headers.vvectory = parseInt(a2[1], 10);
                break;
              case "METRICSSET":
              case "CONTENTVERSION":
                this.__headers[e3.toLowerCase()] = parseInt(r3, 10);
                break;
              case "CHARS":
                return console.warn("It looks like the font does not have property block beginning with 'STARTPROPERTIES' keyword"), this.__parse_headers_after(), this.__curline_chars = t2, void (yield this.__parse_glyph_count());
              case "STARTCHAR":
                return console.warn("It looks like the font does not have property block beginning with 'STARTPROPERTIES' keyword"), console.warn("Cannot find 'CHARS' line"), this.__parse_headers_after(), this.__curline_startchar = t2, void (yield this.__prepare_glyphs());
            }
          }
          if (1 === s2 && "ENDFONT" === i2[0].trim())
            return console.warn("It looks like the font does not have property block beginning with 'STARTPROPERTIES' keyword"), void console.warn("This font does not have any glyphs");
        }
      });
    }
    __parse_headers_after() {
      "metricsset" in this.__headers || (this.__headers.metricsset = 0), this.headers = this.__headers;
    }
    __parse_props() {
      var e2, n2;
      return t(this, void 0, void 0, function* () {
        for (; ; ) {
          const t2 = (null === (n2 = yield null === (e2 = this.__f) || void 0 === e2 ? void 0 : e2.next()) || void 0 === n2 ? void 0 : n2.value).split(/ (.+)/, 2), r2 = t2.length;
          if (2 === r2) {
            const e3 = t2[0], n3 = t2[1].replace(/^[\s"'\t\r\n]+|[\s"'\t\r\n]+$/g, "");
            "COMMENT" === e3 ? ("comment" in this.props && Array.isArray(this.props.comment) || (this.props.comment = []), this.props.comment.push(n3.replace(/^[\s"'\t\r\n]+|[\s"'\t\r\n]+$/g, ""))) : this.props[e3.toLowerCase()] = n3;
          } else if (1 === r2) {
            const e3 = t2[0].trim();
            if ("ENDPROPERTIES" === e3)
              return void (yield this.__parse_glyph_count());
            if ("ENDFONT" === e3)
              return void console.warn("This font does not have any glyphs");
            this.props[e3] = null;
          }
        }
      });
    }
    __parse_glyph_count() {
      var e2, n2;
      return t(this, void 0, void 0, function* () {
        let t2;
        if (null === this.__curline_chars ? t2 = null === (n2 = yield null === (e2 = this.__f) || void 0 === e2 ? void 0 : e2.next()) || void 0 === n2 ? void 0 : n2.value : (t2 = this.__curline_chars, this.__curline_chars = null), "ENDFONT" === t2.trim())
          return void console.warn("This font does not have any glyphs");
        const r2 = t2.split(/ (.+)/, 2);
        "CHARS" === r2[0] ? this.__glyph_count_to_check = parseInt(r2[1].trim(), 10) : (this.__curline_startchar = t2, console.warn("Cannot find 'CHARS' line next to 'ENDPROPERTIES' line")), yield this.__prepare_glyphs();
      });
    }
    __prepare_glyphs() {
      var e2, r2;
      return t(this, void 0, void 0, function* () {
        let t2 = 0, i2 = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], s2 = [], a2 = false, o2 = false;
        for (; ; ) {
          let l2;
          if (null === this.__curline_startchar ? l2 = null === (r2 = yield null === (e2 = this.__f) || void 0 === e2 ? void 0 : e2.next()) || void 0 === r2 ? void 0 : r2.value : (l2 = this.__curline_startchar, this.__curline_startchar = null), null == l2)
            return console.warn("This font does not have 'ENDFONT' keyword"), void this.__prepare_glyphs_after();
          const h2 = l2.split(/ (.+)/, 2), c = h2.length;
          if (2 === c) {
            const e3 = h2[0], r3 = h2[1].trim();
            let s3;
            switch (e3) {
              case "STARTCHAR":
                i2 = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], i2[0] = r3, o2 = false;
                break;
              case "ENCODING":
                t2 = parseInt(r3, 10), i2[1] = t2;
                break;
              case "BBX":
                s3 = r3.split(" "), i2[2] = parseInt(s3[0], 10), i2[3] = parseInt(s3[1], 10), i2[4] = parseInt(s3[2], 10), i2[5] = parseInt(s3[3], 10);
                break;
              case "SWIDTH":
                s3 = r3.split(" "), i2[6] = parseInt(s3[0], 10), i2[7] = parseInt(s3[1], 10);
                break;
              case "DWIDTH":
                s3 = r3.split(" "), i2[8] = parseInt(s3[0], 10), i2[9] = parseInt(s3[1], 10);
                break;
              case "SWIDTH1":
                s3 = r3.split(" "), i2[10] = parseInt(s3[0], 10), i2[11] = parseInt(s3[1], 10);
                break;
              case "DWIDTH1":
                s3 = r3.split(" "), i2[12] = parseInt(s3[0], 10), i2[13] = parseInt(s3[1], 10);
                break;
              case "VVECTOR":
                s3 = n.split(r3), i2[14] = parseInt(s3[0], 10), i2[15] = parseInt(s3[1], 10);
            }
          } else if (1 === c) {
            const e3 = h2[0].trim();
            switch (e3) {
              case "BITMAP":
                s2 = [], a2 = true;
                break;
              case "ENDCHAR":
                a2 = false, i2[16] = s2, this.glyphs.set(t2, i2), o2 = true;
                break;
              case "ENDFONT":
                if (o2)
                  return void this.__prepare_glyphs_after();
              default:
                a2 && s2.push(e3);
            }
          }
        }
      });
    }
    __prepare_glyphs_after() {
      const t2 = this.glyphs.size;
      this.__glyph_count_to_check !== t2 && (null === this.__glyph_count_to_check ? console.warn("The glyph count next to 'CHARS' keyword does not exist") : console.warn(`The glyph count next to 'CHARS' keyword is ${this.__glyph_count_to_check.toString()}, which does not match the actual glyph count ${t2.toString()}`));
    }
    get length() {
      return this.glyphs.size;
    }
    itercps(t2, e2) {
      const n2 = null != t2 ? t2 : 1, r2 = null != e2 ? e2 : null;
      let i2;
      const s2 = [...this.glyphs.keys()];
      switch (n2) {
        case 1:
          i2 = s2.sort((t3, e3) => t3 - e3);
          break;
        case 0:
          i2 = s2;
          break;
        case 2:
          i2 = s2.sort((t3, e3) => e3 - t3);
          break;
        case -1:
          i2 = s2.reverse();
      }
      if (null !== r2) {
        const t3 = (t4) => {
          if ("number" == typeof r2)
            return t4 < r2;
          if (Array.isArray(r2) && 2 === r2.length && "number" == typeof r2[0] && "number" == typeof r2[1])
            return t4 <= r2[1] && t4 >= r2[0];
          if (Array.isArray(r2) && Array.isArray(r2[0]))
            for (const e3 of r2) {
              const [n3, r3] = e3;
              if (t4 <= r3 && t4 >= n3)
                return true;
            }
          return false;
        };
        i2 = i2.filter(t3);
      }
      return i2;
    }
    *iterglyphs(t2, e2) {
      for (const n2 of this.itercps(t2, e2))
        yield this.glyphbycp(n2);
    }
    glyphbycp(t2) {
      const e2 = this.glyphs.get(t2);
      if (null == e2)
        return console.warn(`Glyph "${String.fromCodePoint(t2)}" (codepoint ${t2.toString()}) does not exist in the font. Will return 'null'`), null;
      {
        const t3 = {};
        return i.forEach((n2, r2) => {
          var i2, s2, a2;
          i2 = t3, s2 = n2, a2 = e2[r2], i2[s2] = a2;
        }), new l(t3, this);
      }
    }
    glyph(t2) {
      const e2 = t2.codePointAt(0);
      return void 0 === e2 ? null : this.glyphbycp(e2);
    }
    lacksglyphs(t2) {
      const e2 = [], n2 = t2.length;
      for (let r2, i2 = 0; i2 < n2; i2++) {
        r2 = t2[i2];
        const n3 = r2.codePointAt(0);
        void 0 !== n3 && this.glyphs.has(n3) || e2.push(r2);
      }
      return 0 !== e2.length ? e2 : null;
    }
    drawcps(t2, e2 = {}) {
      var n2, i2, o2, c, d, _, p;
      const u = null !== (n2 = e2.linelimit) && void 0 !== n2 ? n2 : 512, f = null !== (i2 = e2.mode) && void 0 !== i2 ? i2 : 1, b = null !== (o2 = e2.direction) && void 0 !== o2 ? o2 : "lrtb", y = null !== (c = e2.usecurrentglyphspacing) && void 0 !== c && c, g = null !== (d = e2.missing) && void 0 !== d ? d : null;
      if (void 0 === this.headers)
        throw new Error("Font is not loaded");
      let v, w, m, I, S, k, x, T, E, A, R, N, O, D, P, C, $, H;
      const M = null !== (_ = s[b]) && void 0 !== _ ? _ : b, F = M.slice(0, 2), W = M.slice(2, 4);
      F in a && W in a ? (k = a[F], x = a[W]) : (k = 1, x = 0), 0 === x || 2 === x ? v = 1 : 1 !== x && -1 !== x || (v = 0), 1 === k || -1 === k ? w = 1 : 2 !== k && 0 !== k || (w = 0), 1 === f && (T = k > 0 ? this.headers.fbbx : this.headers.fbby, k > 0 ? (N = "dwx0", O = "dwy0") : (N = "dwx1", O = "dwy1"), R = N in this.headers ? this.headers[N] : O in this.headers ? this.headers[O] : null);
      const j = [];
      I = [];
      const B = [];
      P = [], C = 0;
      const G = () => {
        j.push(I), y ? P.shift() : P.pop(), B.push(P);
      }, V = t2[Symbol.iterator]();
      for ($ = false; ; ) {
        if ($)
          $ = false;
        else {
          if (S = null === (p = V.next()) || void 0 === p ? void 0 : p.value, void 0 === S)
            break;
          const t3 = this.glyphbycp(S);
          E = null !== t3 ? t3 : g ? g instanceof l ? g : new l(g, this) : new l(r, this), m = E.draw(), H = m.width(), D = 0, 1 === f && void 0 !== N && void 0 !== O && (A = E.meta[N] || E.meta[O], null == A && (A = R), null != A && void 0 !== T && (D = A - T));
        }
        if (void 0 !== H && void 0 !== D && void 0 !== m && void 0 !== E && void 0 !== S)
          if (C += H + D, C <= u)
            I.push(m), P.push(D);
          else {
            if (0 === I.length)
              throw new Error(`\`_linelimit\` (${u}) is too small the line can't even contain one glyph: "${E.chr()}" (codepoint ${S}, width: ${H})`);
            G(), C = 0, I = [], P = [], $ = true;
          }
      }
      0 !== I.length && G();
      const z = j.map((t3, e3) => h.concatall(t3, { direction: k, align: v, offsetlist: B[e3] }));
      return h.concatall(z, { direction: x, align: w });
    }
    draw(t2, e2 = {}) {
      const { linelimit: n2, mode: r2, direction: i2, usecurrentglyphspacing: s2, missing: a2 } = e2;
      return this.drawcps(t2.split("").map((t3) => {
        const e3 = t3.codePointAt(0);
        return void 0 === e3 ? 8203 : e3;
      }), { linelimit: n2, mode: r2, direction: i2, usecurrentglyphspacing: s2, missing: a2 });
    }
    drawall(t2 = {}) {
      const { order: e2, r: n2, linelimit: r2, mode: i2, direction: s2, usecurrentglyphspacing: a2 } = t2, o2 = null != i2 ? i2 : 0;
      return this.drawcps(this.itercps(e2, n2), { linelimit: r2, mode: o2, direction: s2, usecurrentglyphspacing: a2 });
    }
  };
  var l = class {
    constructor(t2, e2) {
      this.meta = t2, this.font = e2;
    }
    toString() {
      return this.draw().toString();
    }
    repr() {
      var t2;
      return "Glyph(" + JSON.stringify(this.meta, null, 2) + ", Font(<" + (null === (t2 = this.font.headers) || void 0 === t2 ? void 0 : t2.fontname) + ">)";
    }
    cp() {
      return this.meta.codepoint;
    }
    chr() {
      return String.fromCodePoint(this.cp());
    }
    draw(t2, e2) {
      const n2 = null != e2 ? e2 : null;
      let r2;
      switch (null != t2 ? t2 : 0) {
        case 0:
          r2 = this.__draw_fbb();
          break;
        case 1:
          r2 = this.__draw_bb();
          break;
        case 2:
          r2 = this.__draw_original();
          break;
        case -1:
          if (null === n2)
            throw new Error("Parameter bb in draw() method must be set when mode=-1");
          r2 = this.__draw_user_specified(n2);
      }
      return r2;
    }
    __draw_user_specified(t2) {
      const e2 = this.meta.bbxoff, n2 = this.meta.bbyoff, [r2, i2, s2, a2] = t2;
      return this.__draw_bb().crop(r2, i2, -e2 + s2, -n2 + a2);
    }
    __draw_original() {
      return new h(this.meta.hexdata.map((t2) => t2 ? parseInt(t2, 16).toString(2).padStart(4 * t2.length, "0") : ""));
    }
    __draw_bb() {
      const t2 = this.meta.bbw, e2 = this.meta.bbh, n2 = this.__draw_original(), r2 = n2.bindata, i2 = r2.length;
      return i2 !== e2 && console.warn(`Glyph "${this.meta.glyphname.toString()}" (codepoint ${this.meta.codepoint.toString()})'s bbh, ${e2.toString()}, does not match its hexdata line count, ${i2.toString()}`), n2.bindata = r2.map((e3) => e3.slice(0, t2)), n2;
    }
    __draw_fbb() {
      const t2 = this.font.headers;
      if (void 0 === t2)
        throw new Error("Font is not loaded");
      return this.__draw_user_specified([t2.fbbx, t2.fbby, t2.fbbxoff, t2.fbbyoff]);
    }
    origin(t2 = {}) {
      var e2, n2, r2, i2;
      const s2 = null !== (e2 = t2.mode) && void 0 !== e2 ? e2 : 0, a2 = null !== (n2 = t2.fromorigin) && void 0 !== n2 && n2, o2 = null !== (r2 = t2.xoff) && void 0 !== r2 ? r2 : null, l2 = null !== (i2 = t2.yoff) && void 0 !== i2 ? i2 : null;
      let h2;
      const c = this.meta.bbxoff, d = this.meta.bbyoff;
      switch (s2) {
        case 0:
          const t3 = this.font.headers;
          if (void 0 === t3)
            throw new Error("Font is not loaded");
          h2 = [t3.fbbxoff, t3.fbbyoff];
          break;
        case 1:
        case 2:
          h2 = [c, d];
          break;
        case -1:
          if (null === o2 || null === l2)
            throw new Error("Parameter xoff and yoff in origin() method must be all set when mode=-1");
          h2 = [o2, l2];
      }
      return a2 ? h2 : [0 - h2[0], 0 - h2[1]];
    }
  };
  var h = class _h {
    constructor(t2) {
      this.bindata = t2;
    }
    toString() {
      return this.bindata.join("\n").replace(/0/g, ".").replace(/1/g, "#").replace(/2/g, "&");
    }
    repr() {
      return `Bitmap(${JSON.stringify(this.bindata, null, 2)})`;
    }
    width() {
      return this.bindata[0].length;
    }
    height() {
      return this.bindata.length;
    }
    clone() {
      return new _h([...this.bindata]);
    }
    static __crop_string(t2, e2, n2) {
      let r2 = t2;
      const i2 = t2.length;
      let s2 = 0;
      e2 < 0 && (s2 = 0 - e2, r2 = r2.padStart(s2 + i2, "0")), e2 + n2 > i2 && (r2 = r2.padEnd(e2 + n2 - i2 + r2.length, "0"));
      const a2 = e2 + s2;
      return r2.slice(a2, a2 + n2);
    }
    static __string_offset_concat(t2, e2, n2) {
      const r2 = null != n2 ? n2 : 0;
      if (0 === r2)
        return t2 + e2;
      const i2 = t2.length, s2 = i2 + r2, a2 = s2 + e2.length, o2 = Math.min(0, s2), l2 = Math.max(i2, a2), c = _h.__crop_string(t2, o2, l2 - o2), d = _h.__crop_string(e2, o2 - s2, l2 - o2);
      return c.split("").map((t3, e3) => (parseInt(d[e3], 10) || parseInt(t3, 10)).toString()).join("");
    }
    static __listofstr_offset_concat(t2, e2, n2) {
      const r2 = null != n2 ? n2 : 0;
      let i2, s2;
      if (0 === r2)
        return t2.concat(e2);
      const a2 = t2[0].length, o2 = t2.length, l2 = o2 + r2, h2 = l2 + e2.length, c = Math.min(0, l2), d = Math.max(o2, h2), _ = [];
      for (let n3 = c; n3 < d; n3++)
        i2 = n3 < 0 || n3 >= o2 ? "0".repeat(a2) : t2[n3], s2 = n3 < l2 || n3 >= h2 ? "0".repeat(a2) : e2[n3 - l2], _.push(i2.split("").map((t3, e3) => (parseInt(s2[e3], 10) || parseInt(t3, 10)).toString()).join(""));
      return _;
    }
    static __crop_bitmap(t2, e2, n2, r2, i2) {
      let s2;
      const a2 = [], o2 = t2.length;
      for (let l2 = 0; l2 < n2; l2++)
        s2 = o2 - i2 - n2 + l2, s2 < 0 || s2 >= o2 ? a2.push("0".repeat(e2)) : a2.push(_h.__crop_string(t2[s2], r2, e2));
      return a2;
    }
    crop(t2, e2, n2, r2) {
      const i2 = null != n2 ? n2 : 0, s2 = null != r2 ? r2 : 0;
      return this.bindata = _h.__crop_bitmap(this.bindata, t2, e2, i2, s2), this;
    }
    overlay(t2) {
      const e2 = this.bindata, n2 = t2.bindata;
      return e2.length !== n2.length && console.warn("the bitmaps to overlay have different height"), e2[0].length !== n2[0].length && console.warn("the bitmaps to overlay have different width"), this.bindata = e2.map((t3, e3) => {
        const r2 = t3, i2 = n2[e3];
        return r2.split("").map((t4, e4) => (parseInt(i2[e4], 10) || parseInt(t4, 10)).toString()).join("");
      }), this;
    }
    static concatall(t2, e2 = {}) {
      var n2, r2, i2;
      const s2 = null !== (n2 = e2.direction) && void 0 !== n2 ? n2 : 1, a2 = null !== (r2 = e2.align) && void 0 !== r2 ? r2 : 1, o2 = null !== (i2 = e2.offsetlist) && void 0 !== i2 ? i2 : null;
      let l2, c, d, _, p, u, f;
      if (s2 > 0) {
        d = Math.max(...t2.map((t3) => t3.height())), p = Array(d).fill("");
        const e3 = (t3, e4, n3) => 1 === s2 ? _h.__string_offset_concat(t3, e4, n3) : _h.__string_offset_concat(e4, t3, n3);
        for (let n3 = 0; n3 < d; n3++) {
          c = a2 ? -n3 - 1 : n3, _ = 0;
          const r3 = t2.length;
          for (let i3 = 0; i3 < r3; i3++) {
            const r4 = t2[i3];
            o2 && 0 !== i3 && (_ = o2[i3 - 1]), n3 < r4.height() ? c >= 0 ? p[c] = e3(p[c], r4.bindata[c], _) : p[d + c] = e3(p[d + c], r4.bindata[r4.height() + c], _) : c >= 0 ? p[c] = e3(p[c], "0".repeat(r4.width()), _) : p[d + c] = e3(p[d + c], "0".repeat(r4.width()), _);
          }
        }
      } else {
        d = Math.max(...t2.map((t3) => t3.width())), p = [], _ = 0;
        const e3 = t2.length;
        for (let n3 = 0; n3 < e3; n3++) {
          const e4 = t2[n3];
          o2 && 0 !== n3 && (_ = o2[n3 - 1]), l2 = e4.bindata, u = e4.width(), u !== d && (f = a2 ? 0 : u - d, l2 = this.__crop_bitmap(l2, d, e4.height(), f, 0)), p = 0 === s2 ? _h.__listofstr_offset_concat(p, l2, _) : _h.__listofstr_offset_concat(l2, p, _);
        }
      }
      return new this(p);
    }
    concat(t2, e2 = {}) {
      const { direction: n2, align: r2, offset: i2 } = e2, s2 = null != i2 ? i2 : 0;
      return this.bindata = _h.concatall([this, t2], { direction: n2, align: r2, offsetlist: [s2] }).bindata, this;
    }
    static __enlarge_bindata(t2, e2, n2) {
      const r2 = null != e2 ? e2 : 1, i2 = null != n2 ? n2 : 1;
      let s2 = [...t2];
      return r2 > 1 && (s2 = s2.map((t3) => t3.split("").reduce((t4, e3) => t4.concat(Array(r2).fill(e3)), []).join(""))), i2 > 1 && (s2 = s2.reduce((t3, e3) => t3.concat(Array(i2).fill(e3)), [])), s2;
    }
    enlarge(t2, e2) {
      return this.bindata = _h.__enlarge_bindata(this.bindata, t2, e2), this;
    }
    replace(t2, e2) {
      const n2 = "number" == typeof t2 ? t2.toString() : t2, r2 = "number" == typeof e2 ? e2.toString() : e2;
      return this.bindata = this.bindata.map((t3) => ((t4, e3, n3) => {
        if ("replaceAll" in String.prototype)
          return t4.replaceAll(e3, n3);
        {
          const r3 = (t5) => t5.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
          return t4.replace(new RegExp(r3(e3), "g"), n3);
        }
      })(t3, n2, r2)), this;
    }
    shadow(t2, e2) {
      const n2 = null != t2 ? t2 : 1, r2 = null != e2 ? e2 : -1;
      let i2, s2, a2, o2, l2, h2;
      const c = this.clone();
      return h2 = this.width(), i2 = this.height(), h2 += Math.abs(n2), i2 += Math.abs(r2), c.bindata = c.bindata.map((t3) => t3.replace(/1/g, "2")), n2 > 0 ? (s2 = 0, o2 = -n2) : (s2 = n2, o2 = 0), r2 > 0 ? (a2 = 0, l2 = -r2) : (a2 = r2, l2 = 0), this.crop(h2, i2, s2, a2), c.crop(h2, i2, o2, l2), c.overlay(this), this.bindata = c.bindata, this;
    }
    glow(t2) {
      var e2, n2, r2, i2, s2, a2, o2, l2, h2, c, d, _, p, u;
      const f = null != t2 ? t2 : 0;
      let b, y, g, v;
      g = this.width(), v = this.height(), g += 2, v += 2, this.crop(g, v, -1, -1);
      const w = this.todata(2), m = w.length;
      for (let t3 = 0; t3 < m; t3++) {
        b = w[t3];
        const g2 = b.length;
        for (let v2 = 0; v2 < g2; v2++)
          y = b[v2], 1 === y && ((e2 = w[t3])[n2 = v2 - 1] || (e2[n2] = 2), (r2 = w[t3])[i2 = v2 + 1] || (r2[i2] = 2), (s2 = w[t3 - 1])[v2] || (s2[v2] = 2), (a2 = w[t3 + 1])[v2] || (a2[v2] = 2), 1 === f && ((o2 = w[t3 - 1])[l2 = v2 - 1] || (o2[l2] = 2), (h2 = w[t3 - 1])[c = v2 + 1] || (h2[c] = 2), (d = w[t3 + 1])[_ = v2 - 1] || (d[_] = 2), (p = w[t3 + 1])[u = v2 + 1] || (p[u] = 2)));
      }
      return this.bindata = w.map((t3) => t3.map((t4) => t4.toString()).join("")), this;
    }
    bytepad(t2) {
      const e2 = null != t2 ? t2 : 8, n2 = this.width(), r2 = this.height(), i2 = n2 % e2;
      return 0 === i2 ? this : this.crop(n2 + e2 - i2, r2);
    }
    todata(t2) {
      let e2;
      switch (null != t2 ? t2 : 1) {
        case 0:
          e2 = this.bindata.join("\n");
          break;
        case 1:
          e2 = this.bindata;
          break;
        case 2:
          e2 = this.bindata.map((t3) => t3.split("").map((t4) => parseInt(t4, 10)));
          break;
        case 3:
          e2 = [].concat(...this.todata(2));
          break;
        case 4:
          e2 = this.bindata.map((t3) => {
            if (!/^[01]+$/.test(t3))
              throw new Error(`Invalid binary string: ${t3}`);
            return parseInt(t3, 2).toString(16).padStart(-1 * Math.floor(-1 * this.width() / 4), "0");
          });
          break;
        case 5:
          e2 = this.bindata.map((t3) => {
            if (!/^[01]+$/.test(t3))
              throw new Error(`Invalid binary string: ${t3}`);
            return parseInt(t3, 2);
          });
      }
      return e2;
    }
    draw2canvas(t2, e2) {
      const n2 = null != e2 ? e2 : { 0: null, 1: "black", 2: "red" };
      return this.todata(2).forEach((e3, r2) => {
        e3.forEach((e4, i2) => {
          const s2 = e4.toString();
          if ("0" === s2 || "1" === s2 || "2" === s2) {
            const e5 = n2[s2];
            null != e5 && (t2.fillStyle = e5, t2.fillRect(i2, r2, 1, 1));
          }
        });
      }), this;
    }
  };
  var $Font = (e2) => t(void 0, void 0, void 0, function* () {
    return yield new o().load_filelines(e2);
  });

  // src/bdf-font.js
  var BDF_FONT_CONFIG = {
    "VCR_OSD_MONO": {
      16: { file: "VCR_OSD_MONO_16.bdf", yOffset: 0 },
      24: { file: "VCR_OSD_MONO_24.bdf", yOffset: 0 },
      32: { file: "VCR_OSD_MONO_32.bdf", yOffset: 2 }
      // Match pypixelcolor offset
    },
    "CUSONG": {
      16: { file: "CUSONG_16.bdf", yOffset: -1 },
      // Match pypixelcolor offset
      24: { file: "CUSONG_24.bdf", yOffset: 0 },
      32: { file: "CUSONG_32.bdf", yOffset: 0 }
    }
  };
  var fontCache = /* @__PURE__ */ new Map();
  var fontLoadPromises2 = /* @__PURE__ */ new Map();
  function getBdfFontUrl(filename) {
    const isHomeAssistant = typeof window.hassConnection !== "undefined" || window.location.pathname.includes("/lovelace") || window.location.pathname.includes("/dashboard") || document.querySelector("home-assistant") !== null;
    if (isHomeAssistant) {
      return `/hacsfiles/ipixel_color/fonts/${filename}`;
    }
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1);
    return `${basePath}fonts/${filename}`;
  }
  function getHeightKey2(height) {
    if (height <= 18)
      return 16;
    if (height <= 28)
      return 24;
    return 32;
  }
  async function loadBdfFont(fontName, heightKey = 16) {
    const cacheKey = `${fontName}_${heightKey}`;
    if (fontCache.has(cacheKey)) {
      return fontCache.get(cacheKey);
    }
    if (fontLoadPromises2.has(cacheKey)) {
      return fontLoadPromises2.get(cacheKey);
    }
    const fontConfig = BDF_FONT_CONFIG[fontName];
    if (!fontConfig || !fontConfig[heightKey]) {
      console.warn(`iPIXEL BDF: No config for font ${fontName} at height ${heightKey}`);
      return null;
    }
    const config = fontConfig[heightKey];
    const loadPromise = (async () => {
      try {
        const fontUrl = getBdfFontUrl(config.file);
        console.log(`iPIXEL BDF: Loading ${fontUrl}...`);
        const font = await $Font($fetchline(fontUrl));
        const result = { font, config };
        fontCache.set(cacheKey, result);
        console.log(`iPIXEL BDF: Font ${fontName} (${heightKey}px) loaded successfully`);
        return result;
      } catch (e2) {
        console.warn(`iPIXEL BDF: Failed to load font ${fontName} (${heightKey}px):`, e2);
        fontLoadPromises2.delete(cacheKey);
        return null;
      }
    })();
    fontLoadPromises2.set(cacheKey, loadPromise);
    return loadPromise;
  }
  function isBdfFontLoaded(fontName, heightKey = 16) {
    const cacheKey = `${fontName}_${heightKey}`;
    return fontCache.has(cacheKey);
  }
  function textToPixelsBdf(text, width, height, fgColor = "#ff6600", bgColor = "#111", fontName = "VCR_OSD_MONO") {
    const heightKey = getHeightKey2(height);
    const cacheKey = `${fontName}_${heightKey}`;
    const cached = fontCache.get(cacheKey);
    if (!cached) {
      loadBdfFont(fontName, heightKey);
      return null;
    }
    const { font, config } = cached;
    const pixels = new Array(width * height).fill(bgColor);
    if (!text || text.trim() === "") {
      return pixels;
    }
    try {
      const bitmap = font.draw(text, { direction: "lrtb", mode: 1 });
      const bindata = bitmap.bindata;
      const textWidth = bitmap.width();
      const textHeight = bitmap.height();
      const xOffset = Math.floor((width - textWidth) / 2);
      const yOffset = Math.floor((height - textHeight) / 2) + (config.yOffset || 0);
      for (let row = 0; row < textHeight; row++) {
        const rowData = bindata[row] || "";
        for (let col = 0; col < rowData.length; col++) {
          const px = xOffset + col;
          const py = yOffset + row;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = py * width + px;
            pixels[idx] = rowData[col] === "1" ? fgColor : bgColor;
          }
        }
      }
    } catch (e2) {
      console.warn("iPIXEL BDF: Error rendering text:", e2);
      return null;
    }
    return pixels;
  }
  function textToScrollPixelsBdf(text, displayWidth, height, fgColor = "#ff6600", bgColor = "#111", fontName = "VCR_OSD_MONO") {
    const heightKey = getHeightKey2(height);
    const cacheKey = `${fontName}_${heightKey}`;
    const cached = fontCache.get(cacheKey);
    if (!cached) {
      loadBdfFont(fontName, heightKey);
      return null;
    }
    const { font, config } = cached;
    if (!text || text.trim() === "") {
      const extendedWidth = displayWidth * 3;
      const pixels = new Array(extendedWidth * height).fill(bgColor);
      return { pixels, width: extendedWidth };
    }
    try {
      const bitmap = font.draw(text, { direction: "lrtb", mode: 1 });
      const bindata = bitmap.bindata;
      const textWidth = bitmap.width();
      const textHeight = bitmap.height();
      const extendedWidth = displayWidth + textWidth + displayWidth;
      const pixels = new Array(extendedWidth * height).fill(bgColor);
      const xStart = displayWidth;
      const yOffset = Math.floor((height - textHeight) / 2) + (config.yOffset || 0);
      for (let row = 0; row < textHeight; row++) {
        const rowData = bindata[row] || "";
        for (let col = 0; col < rowData.length; col++) {
          const px = xStart + col;
          const py = yOffset + row;
          if (px >= 0 && px < extendedWidth && py >= 0 && py < height) {
            const idx = py * extendedWidth + px;
            pixels[idx] = rowData[col] === "1" ? fgColor : bgColor;
          }
        }
      }
      return { pixels, width: extendedWidth };
    } catch (e2) {
      console.warn("iPIXEL BDF: Error rendering scroll text:", e2);
      return null;
    }
  }

  // src/effects/text-effects.js
  var TextEffects = class {
    constructor(renderer) {
      this.renderer = renderer;
    }
    /**
     * Initialize effect state
     */
    init(effectName, state) {
      const { width, height } = this.renderer;
      switch (effectName) {
        case "scroll_ltr":
        case "scroll_rtl":
          state.offset = 0;
          break;
        case "blink":
          state.visible = true;
          break;
        case "snow":
        case "breeze":
          state.phases = [];
          for (let i2 = 0; i2 < width * height; i2++) {
            state.phases[i2] = Math.random() * Math.PI * 2;
          }
          break;
        case "laser":
          state.position = 0;
          break;
        case "fade":
          state.opacity = 0;
          state.direction = 1;
          break;
        case "typewriter":
          state.charIndex = 0;
          state.cursorVisible = true;
          break;
        case "bounce":
          state.offset = 0;
          state.direction = 1;
          break;
        case "sparkle":
          state.sparkles = [];
          for (let i2 = 0; i2 < Math.floor(width * height * 0.1); i2++) {
            state.sparkles.push({
              x: Math.floor(Math.random() * width),
              y: Math.floor(Math.random() * height),
              brightness: Math.random(),
              speed: 0.05 + Math.random() * 0.1
            });
          }
          break;
      }
    }
    /**
     * Step effect forward
     */
    step(effectName, state) {
      const { width, extendedWidth } = this.renderer;
      switch (effectName) {
        case "scroll_ltr":
          state.offset -= 1;
          if (state.offset <= -(extendedWidth || width)) {
            state.offset = width;
          }
          break;
        case "scroll_rtl":
          state.offset += 1;
          if (state.offset >= (extendedWidth || width)) {
            state.offset = -width;
          }
          break;
        case "blink":
          state.visible = !state.visible;
          break;
        case "laser":
          state.position = (state.position + 1) % width;
          break;
        case "fade":
          state.opacity += state.direction * 0.05;
          if (state.opacity >= 1) {
            state.opacity = 1;
            state.direction = -1;
          } else if (state.opacity <= 0) {
            state.opacity = 0;
            state.direction = 1;
          }
          break;
        case "typewriter":
          if (state.tick % 3 === 0) {
            state.charIndex++;
          }
          state.cursorVisible = state.tick % 10 < 5;
          break;
        case "bounce":
          state.offset += state.direction;
          const maxOffset = Math.max(0, (extendedWidth || width) - width);
          if (state.offset >= maxOffset) {
            state.offset = maxOffset;
            state.direction = -1;
          } else if (state.offset <= 0) {
            state.offset = 0;
            state.direction = 1;
          }
          break;
        case "sparkle":
          for (const sparkle of state.sparkles) {
            sparkle.brightness += sparkle.speed;
            if (sparkle.brightness > 1) {
              sparkle.brightness = 0;
              sparkle.x = Math.floor(Math.random() * width);
              sparkle.y = Math.floor(Math.random() * this.renderer.height);
            }
          }
          break;
      }
    }
    /**
     * Render effect to buffer
     */
    render(effectName, state, pixels, extendedPixels, extendedWidth) {
      const { width, height } = this.renderer;
      const srcPixels = extendedPixels || pixels || [];
      const displayPixels = pixels || [];
      const srcWidth = extendedWidth || width;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let color;
          let sourceX = x;
          if (effectName === "scroll_ltr" || effectName === "scroll_rtl" || effectName === "bounce") {
            sourceX = x - (state.offset || 0);
            while (sourceX < 0)
              sourceX += srcWidth;
            while (sourceX >= srcWidth)
              sourceX -= srcWidth;
            color = srcPixels[y * srcWidth + sourceX] || "#111";
          } else if (effectName === "typewriter") {
            const charWidth = 6;
            const maxX = (state.charIndex || 0) * charWidth;
            if (x < maxX) {
              color = displayPixels[y * width + x] || "#111";
            } else if (x === maxX && state.cursorVisible) {
              color = "#ffffff";
            } else {
              color = "#111";
            }
          } else {
            color = displayPixels[y * width + x] || "#111";
          }
          let [r2, g, b] = this._hexToRgb(color);
          const isLit = r2 > 20 || g > 20 || b > 20;
          if (isLit) {
            switch (effectName) {
              case "blink":
                if (!state.visible) {
                  r2 = g = b = 17;
                }
                break;
              case "snow": {
                const phase = state.phases?.[y * width + x] || 0;
                const tick = state.tick || 0;
                const factor = 0.3 + 0.7 * Math.abs(Math.sin(phase + tick * 0.3));
                r2 *= factor;
                g *= factor;
                b *= factor;
                break;
              }
              case "breeze": {
                const phase = state.phases?.[y * width + x] || 0;
                const tick = state.tick || 0;
                const factor = 0.4 + 0.6 * Math.abs(Math.sin(phase + tick * 0.15 + x * 0.2));
                r2 *= factor;
                g *= factor;
                b *= factor;
                break;
              }
              case "laser": {
                const pos = state.position || 0;
                const dist = Math.abs(x - pos);
                const factor = dist < 3 ? 1 : 0.3;
                r2 *= factor;
                g *= factor;
                b *= factor;
                break;
              }
              case "fade": {
                const opacity = state.opacity || 1;
                r2 *= opacity;
                g *= opacity;
                b *= opacity;
                break;
              }
            }
          }
          if (effectName === "sparkle" && state.sparkles) {
            for (const sparkle of state.sparkles) {
              if (sparkle.x === x && sparkle.y === y) {
                const sparkleIntensity = Math.sin(sparkle.brightness * Math.PI);
                r2 = Math.min(255, r2 + sparkleIntensity * 200);
                g = Math.min(255, g + sparkleIntensity * 200);
                b = Math.min(255, b + sparkleIntensity * 200);
              }
            }
          }
          this.renderer.setPixel(x, y, [r2, g, b]);
        }
      }
    }
    /**
     * Convert hex color to RGB array
     */
    _hexToRgb(hex) {
      if (!hex || hex === "#111" || hex === "#000")
        return [17, 17, 17];
      if (hex === "#050505")
        return [5, 5, 5];
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [17, 17, 17];
    }
  };

  // src/effects/ambient-effects.js
  function hsvToRgb(h2, s2, v) {
    let r2, g, b;
    const i2 = Math.floor(h2 * 6);
    const f = h2 * 6 - i2;
    const p = v * (1 - s2);
    const q = v * (1 - f * s2);
    const t2 = v * (1 - (1 - f) * s2);
    switch (i2 % 6) {
      case 0:
        r2 = v;
        g = t2;
        b = p;
        break;
      case 1:
        r2 = q;
        g = v;
        b = p;
        break;
      case 2:
        r2 = p;
        g = v;
        b = t2;
        break;
      case 3:
        r2 = p;
        g = q;
        b = v;
        break;
      case 4:
        r2 = t2;
        g = p;
        b = v;
        break;
      case 5:
        r2 = v;
        g = p;
        b = q;
        break;
    }
    return [r2 * 255, g * 255, b * 255];
  }
  var AmbientEffects = class {
    constructor(renderer) {
      this.renderer = renderer;
    }
    /**
     * Initialize effect state
     */
    init(effectName, state) {
      const { width, height } = this.renderer;
      switch (effectName) {
        case "rainbow":
          state.position = 0;
          break;
        case "matrix":
          const colorModes = [
            [0, 255, 0],
            // Matrix green
            [0, 255, 255],
            // Cyan
            [255, 0, 255]
            // Purple
          ];
          state.colorMode = colorModes[Math.floor(Math.random() * colorModes.length)];
          state.buffer = [];
          for (let y = 0; y < height; y++) {
            state.buffer.push(Array(width).fill(null).map(() => [0, 0, 0]));
          }
          break;
        case "plasma":
          state.time = 0;
          break;
        case "gradient":
          state.time = 0;
          break;
        case "fire":
          state.heat = [];
          for (let i2 = 0; i2 < width * height; i2++) {
            state.heat[i2] = 0;
          }
          state.palette = this._createFirePalette();
          break;
        case "water":
          state.current = [];
          state.previous = [];
          for (let i2 = 0; i2 < width * height; i2++) {
            state.current[i2] = 0;
            state.previous[i2] = 0;
          }
          state.damping = 0.95;
          break;
        case "stars":
          state.stars = [];
          const numStars = Math.floor(width * height * 0.15);
          for (let i2 = 0; i2 < numStars; i2++) {
            state.stars.push({
              x: Math.floor(Math.random() * width),
              y: Math.floor(Math.random() * height),
              brightness: Math.random(),
              speed: 0.02 + Math.random() * 0.05,
              phase: Math.random() * Math.PI * 2
            });
          }
          break;
        case "confetti":
          state.particles = [];
          for (let i2 = 0; i2 < 20; i2++) {
            state.particles.push(this._createConfettiParticle(width, height, true));
          }
          break;
        case "plasma_wave":
          state.time = 0;
          break;
        case "radial_pulse":
          state.time = 0;
          break;
        case "hypnotic":
          state.time = 0;
          break;
        case "lava":
          state.time = 0;
          state.noise = [];
          for (let i2 = 0; i2 < width * height; i2++) {
            state.noise[i2] = Math.random() * Math.PI * 2;
          }
          break;
        case "aurora":
          state.time = 0;
          break;
      }
    }
    /**
     * Step effect forward
     */
    step(effectName, state) {
      const { width, height } = this.renderer;
      switch (effectName) {
        case "rainbow":
          state.position = (state.position + 0.01) % 1;
          break;
        case "matrix":
          this._stepMatrix(state, width, height);
          break;
        case "plasma":
        case "gradient":
          state.time = (state.time || 0) + 0.05;
          break;
        case "fire":
          this._stepFire(state, width, height);
          break;
        case "water":
          this._stepWater(state, width, height);
          break;
        case "stars":
          for (const star of state.stars) {
            star.phase += star.speed;
          }
          break;
        case "confetti":
          for (let i2 = 0; i2 < state.particles.length; i2++) {
            const p = state.particles[i2];
            p.y += p.speed;
            p.x += p.drift;
            p.rotation += p.rotationSpeed;
            if (p.y > height) {
              state.particles[i2] = this._createConfettiParticle(width, height, false);
            }
          }
          break;
        case "plasma_wave":
        case "radial_pulse":
        case "hypnotic":
        case "lava":
        case "aurora":
          state.time = (state.time || 0) + 0.03;
          break;
      }
    }
    /**
     * Render effect to buffer
     */
    render(effectName, state) {
      switch (effectName) {
        case "rainbow":
          this._renderRainbow(state);
          break;
        case "matrix":
          this._renderMatrix(state);
          break;
        case "plasma":
          this._renderPlasma(state);
          break;
        case "gradient":
          this._renderGradient(state);
          break;
        case "fire":
          this._renderFire(state);
          break;
        case "water":
          this._renderWater(state);
          break;
        case "stars":
          this._renderStars(state);
          break;
        case "confetti":
          this._renderConfetti(state);
          break;
        case "plasma_wave":
          this._renderPlasmaWave(state);
          break;
        case "radial_pulse":
          this._renderRadialPulse(state);
          break;
        case "hypnotic":
          this._renderHypnotic(state);
          break;
        case "lava":
          this._renderLava(state);
          break;
        case "aurora":
          this._renderAurora(state);
          break;
      }
    }
    // === Effect implementations ===
    _renderRainbow(state) {
      const { width, height } = this.renderer;
      const position = state.position || 0;
      for (let x = 0; x < width; x++) {
        const hue = (position + x / width) % 1;
        const [r2, g, b] = hsvToRgb(hue, 1, 0.6);
        for (let y = 0; y < height; y++) {
          this.renderer.setPixel(x, y, [r2, g, b]);
        }
      }
    }
    _stepMatrix(state, width, height) {
      const buffer = state.buffer;
      const colorMode = state.colorMode;
      const fadeAmount = 0.15;
      buffer.pop();
      const newRow = buffer[0].map(([r2, g, b]) => [
        r2 * (1 - fadeAmount),
        g * (1 - fadeAmount),
        b * (1 - fadeAmount)
      ]);
      buffer.unshift(JSON.parse(JSON.stringify(newRow)));
      for (let x = 0; x < width; x++) {
        if (Math.random() < 0.08) {
          buffer[0][x] = [
            Math.floor(Math.random() * colorMode[0]),
            Math.floor(Math.random() * colorMode[1]),
            Math.floor(Math.random() * colorMode[2])
          ];
        }
      }
    }
    _renderMatrix(state) {
      const { width, height } = this.renderer;
      const buffer = state.buffer;
      if (!buffer)
        return;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const [r2, g, b] = buffer[y]?.[x] || [0, 0, 0];
          this.renderer.setPixel(x, y, [r2, g, b]);
        }
      }
    }
    _renderPlasma(state) {
      const { width, height } = this.renderer;
      const time = state.time || 0;
      const centerX = width / 2;
      const centerY = height / 2;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const v1 = Math.sin(x / 8 + time);
          const v2 = Math.sin(y / 6 + time * 0.8);
          const v3 = Math.sin(dist / 6 - time * 1.2);
          const v4 = Math.sin((x + y) / 10 + time * 0.5);
          const value = (v1 + v2 + v3 + v4 + 4) / 8;
          const r2 = Math.sin(value * Math.PI * 2) * 0.5 + 0.5;
          const g = Math.sin(value * Math.PI * 2 + 2) * 0.5 + 0.5;
          const b = Math.sin(value * Math.PI * 2 + 4) * 0.5 + 0.5;
          this.renderer.setPixel(x, y, [r2 * 255, g * 255, b * 255]);
        }
      }
    }
    _renderGradient(state) {
      const { width, height } = this.renderer;
      const time = state.time || 0;
      const t2 = time * 10;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const r2 = (Math.sin((x + t2) * 0.05) * 0.5 + 0.5) * 255;
          const g = (Math.cos((y + t2) * 0.05) * 0.5 + 0.5) * 255;
          const b = (Math.sin((x + y + t2) * 0.03) * 0.5 + 0.5) * 255;
          this.renderer.setPixel(x, y, [r2, g, b]);
        }
      }
    }
    _createFirePalette() {
      const palette = [];
      for (let i2 = 0; i2 < 256; i2++) {
        let r2, g, b;
        if (i2 < 64) {
          r2 = i2 * 4;
          g = 0;
          b = 0;
        } else if (i2 < 128) {
          r2 = 255;
          g = (i2 - 64) * 4;
          b = 0;
        } else if (i2 < 192) {
          r2 = 255;
          g = 255;
          b = (i2 - 128) * 4;
        } else {
          r2 = 255;
          g = 255;
          b = 255;
        }
        palette.push([r2, g, b]);
      }
      return palette;
    }
    _stepFire(state, width, height) {
      const heat = state.heat;
      for (let i2 = 0; i2 < width * height; i2++) {
        heat[i2] = Math.max(0, heat[i2] - Math.random() * 10);
      }
      for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const below = (y + 1) * width + x;
          const left = y * width + Math.max(0, x - 1);
          const right = y * width + Math.min(width - 1, x + 1);
          heat[idx] = (heat[below] + heat[left] + heat[right]) / 3.05;
        }
      }
      for (let x = 0; x < width; x++) {
        if (Math.random() < 0.6) {
          heat[(height - 1) * width + x] = 180 + Math.random() * 75;
        }
      }
    }
    _renderFire(state) {
      const { width, height } = this.renderer;
      const heat = state.heat;
      const palette = state.palette;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const h2 = Math.floor(Math.min(255, heat[idx]));
          const [r2, g, b] = palette[h2];
          this.renderer.setPixel(x, y, [r2, g, b]);
        }
      }
    }
    _stepWater(state, width, height) {
      const { current, previous, damping } = state;
      const temp = [...previous];
      for (let i2 = 0; i2 < current.length; i2++) {
        previous[i2] = current[i2];
      }
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          current[idx] = (temp[(y - 1) * width + x] + temp[(y + 1) * width + x] + temp[y * width + (x - 1)] + temp[y * width + (x + 1)]) / 2 - current[idx];
          current[idx] *= damping;
        }
      }
      if (Math.random() < 0.1) {
        const x = Math.floor(Math.random() * (width - 2)) + 1;
        const y = Math.floor(Math.random() * (height - 2)) + 1;
        current[y * width + x] = 255;
      }
    }
    _renderWater(state) {
      const { width, height } = this.renderer;
      const current = state.current;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const value = Math.abs(current[idx]);
          const intensity = Math.min(255, value * 2);
          const r2 = intensity > 200 ? intensity : 0;
          const g = intensity > 150 ? intensity * 0.8 : intensity * 0.3;
          const b = Math.min(255, 50 + intensity);
          this.renderer.setPixel(x, y, [r2, g, b]);
        }
      }
    }
    _renderStars(state) {
      const { width, height } = this.renderer;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          this.renderer.setPixel(x, y, [5, 5, 15]);
        }
      }
      for (const star of state.stars) {
        const brightness = (Math.sin(star.phase) * 0.5 + 0.5) * 255;
        const x = Math.floor(star.x);
        const y = Math.floor(star.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
          this.renderer.setPixel(x, y, [brightness, brightness, brightness * 0.9]);
        }
      }
    }
    _createConfettiParticle(width, height, randomY) {
      const colors = [
        [255, 0, 0],
        // Red
        [0, 255, 0],
        // Green
        [0, 0, 255],
        // Blue
        [255, 255, 0],
        // Yellow
        [255, 0, 255],
        // Magenta
        [0, 255, 255],
        // Cyan
        [255, 128, 0],
        // Orange
        [255, 192, 203]
        // Pink
      ];
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -2,
        speed: 0.2 + Math.random() * 0.3,
        drift: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1 + Math.random(),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      };
    }
    _renderConfetti(state) {
      const { width, height } = this.renderer;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          this.renderer.setPixel(x, y, [10, 10, 10]);
        }
      }
      for (const p of state.particles) {
        const x = Math.floor(p.x);
        const y = Math.floor(p.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
          this.renderer.setPixel(x, y, p.color);
          const shimmer = Math.abs(Math.sin(p.rotation)) * 0.5 + 0.5;
          const [r2, g, b] = p.color;
          this.renderer.setPixel(x, y, [r2 * shimmer, g * shimmer, b * shimmer]);
        }
      }
    }
    // === Shader-inspired effects (ported from ipixel-shader GLSL) ===
    /**
     * Plasma Wave - Multi-frequency sine wave pattern
     * Based on the shader.frag example from ipixel-shader
     */
    _renderPlasmaWave(state) {
      const { width, height } = this.renderer;
      const time = state.time || 0;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const uvX = x / width;
          const uvY = y / height;
          const v = Math.sin(uvX * 10 + time) + Math.sin(uvY * 10 + time) + Math.sin((uvX + uvY) * 10 + time) + Math.sin(Math.sqrt((uvX - 0.5) ** 2 + (uvY - 0.5) ** 2) * 20 - time * 2);
          const r2 = Math.sin(v * Math.PI) * 0.5 + 0.5;
          const g = Math.sin(v * Math.PI + 2.094) * 0.5 + 0.5;
          const b = Math.sin(v * Math.PI + 4.188) * 0.5 + 0.5;
          this.renderer.setPixel(x, y, [r2 * 255, g * 255, b * 255]);
        }
      }
    }
    /**
     * Radial Pulse - Concentric rings emanating from center
     */
    _renderRadialPulse(state) {
      const { width, height } = this.renderer;
      const time = state.time || 0;
      const centerX = width / 2;
      const centerY = height / 2;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const wave = Math.sin(dist * 0.8 - time * 3) * 0.5 + 0.5;
          const pulse = Math.sin(time * 2) * 0.3 + 0.7;
          const hue = (dist / 20 + time * 0.5) % 1;
          const [r2, g, b] = hsvToRgb(hue, 0.8, wave * pulse);
          this.renderer.setPixel(x, y, [r2, g, b]);
        }
      }
    }
    /**
     * Hypnotic - Spiral pattern
     */
    _renderHypnotic(state) {
      const { width, height } = this.renderer;
      const time = state.time || 0;
      const centerX = width / 2;
      const centerY = height / 2;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const spiral = Math.sin(angle * 4 + dist * 0.5 - time * 2);
          const intensity = spiral * 0.5 + 0.5;
          const r2 = intensity * (Math.sin(time) * 0.5 + 0.5);
          const g = intensity * (Math.sin(time + 2.094) * 0.5 + 0.5);
          const b = intensity * (Math.sin(time + 4.188) * 0.5 + 0.5);
          this.renderer.setPixel(x, y, [r2 * 255, g * 255, b * 255]);
        }
      }
    }
    /**
     * Lava - Organic flowing lava/magma effect
     */
    _renderLava(state) {
      const { width, height } = this.renderer;
      const time = state.time || 0;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const uvX = x / width;
          const uvY = y / height;
          const n1 = Math.sin(uvX * 8 + time * 0.7) * Math.cos(uvY * 6 + time * 0.5);
          const n2 = Math.sin(uvX * 12 - time * 0.3) * Math.sin(uvY * 10 + time * 0.8);
          const n3 = Math.cos((uvX + uvY) * 5 + time);
          const value = (n1 + n2 + n3 + 3) / 6;
          let r2, g, b;
          if (value < 0.3) {
            r2 = value * 3 * 100;
            g = 0;
            b = 0;
          } else if (value < 0.6) {
            r2 = 100 + (value - 0.3) * 3 * 155;
            g = (value - 0.3) * 3 * 100;
            b = 0;
          } else {
            r2 = 255;
            g = 100 + (value - 0.6) * 2.5 * 155;
            b = (value - 0.6) * 2.5 * 100;
          }
          this.renderer.setPixel(x, y, [r2, g, b]);
        }
      }
    }
    /**
     * Aurora - Northern lights effect
     */
    _renderAurora(state) {
      const { width, height } = this.renderer;
      const time = state.time || 0;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const uvX = x / width;
          const uvY = y / height;
          const wave1 = Math.sin(uvX * 6 + time) * 0.3;
          const wave2 = Math.sin(uvX * 4 - time * 0.7) * 0.2;
          const wave3 = Math.sin(uvX * 8 + time * 1.3) * 0.15;
          const waveLine = 0.5 + wave1 + wave2 + wave3;
          const distFromWave = Math.abs(uvY - waveLine);
          const intensity = Math.max(0, 1 - distFromWave * 4);
          const glow = Math.pow(intensity, 1.5);
          const colorShift = Math.sin(uvX * 3 + time * 0.5);
          const r2 = glow * (0.2 + colorShift * 0.3) * 255;
          const g = glow * (0.8 + Math.sin(time + uvX) * 0.2) * 255;
          const b = glow * (0.6 + colorShift * 0.4) * 255;
          const starChance = Math.sin(x * 127.1 + y * 311.7) * 0.5 + 0.5;
          const starTwinkle = Math.sin(time * 3 + x + y) * 0.5 + 0.5;
          let finalR = r2;
          let finalG = g;
          let finalB = b;
          if (starChance > 0.98 && intensity < 0.3) {
            const starBright = starTwinkle * 180;
            finalR = Math.max(r2, starBright);
            finalG = Math.max(g, starBright);
            finalB = Math.max(b, starBright * 0.9);
          }
          this.renderer.setPixel(x, y, [finalR, finalG, finalB]);
        }
      }
    }
  };

  // src/effects/color-effects.js
  function hsvToRgb2(h2, s2, v) {
    let r2, g, b;
    const i2 = Math.floor(h2 * 6);
    const f = h2 * 6 - i2;
    const p = v * (1 - s2);
    const q = v * (1 - f * s2);
    const t2 = v * (1 - (1 - f) * s2);
    switch (i2 % 6) {
      case 0:
        r2 = v;
        g = t2;
        b = p;
        break;
      case 1:
        r2 = q;
        g = v;
        b = p;
        break;
      case 2:
        r2 = p;
        g = v;
        b = t2;
        break;
      case 3:
        r2 = p;
        g = q;
        b = v;
        break;
      case 4:
        r2 = t2;
        g = p;
        b = v;
        break;
      case 5:
        r2 = v;
        g = p;
        b = q;
        break;
    }
    return [r2 * 255, g * 255, b * 255];
  }
  var ColorEffects = class {
    constructor(renderer) {
      this.renderer = renderer;
    }
    /**
     * Initialize effect state
     */
    init(effectName, state) {
      switch (effectName) {
        case "color_cycle":
          state.hue = 0;
          break;
        case "rainbow_text":
          state.offset = 0;
          break;
        case "neon":
          state.glowIntensity = 0;
          state.direction = 1;
          state.baseColor = state.fgColor || "#ff00ff";
          break;
      }
    }
    /**
     * Step effect forward
     */
    step(effectName, state) {
      switch (effectName) {
        case "color_cycle":
          state.hue = (state.hue + 0.01) % 1;
          break;
        case "rainbow_text":
          state.offset = (state.offset + 0.02) % 1;
          break;
        case "neon":
          state.glowIntensity += state.direction * 0.05;
          if (state.glowIntensity >= 1) {
            state.glowIntensity = 1;
            state.direction = -1;
          } else if (state.glowIntensity <= 0.3) {
            state.glowIntensity = 0.3;
            state.direction = 1;
          }
          break;
      }
    }
    /**
     * Render effect to buffer
     */
    render(effectName, state, pixels) {
      const { width, height } = this.renderer;
      const displayPixels = pixels || [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const color = displayPixels[y * width + x] || "#111";
          let [r2, g, b] = this._hexToRgb(color);
          const isLit = r2 > 20 || g > 20 || b > 20;
          if (isLit) {
            switch (effectName) {
              case "color_cycle": {
                const [nr, ng, nb] = hsvToRgb2(state.hue, 1, 0.8);
                const brightness = (r2 + g + b) / (3 * 255);
                r2 = nr * brightness;
                g = ng * brightness;
                b = nb * brightness;
                break;
              }
              case "rainbow_text": {
                const hue = (state.offset + x / width) % 1;
                const [nr, ng, nb] = hsvToRgb2(hue, 1, 0.8);
                const brightness = (r2 + g + b) / (3 * 255);
                r2 = nr * brightness;
                g = ng * brightness;
                b = nb * brightness;
                break;
              }
              case "neon": {
                const baseColor = this._hexToRgb(state.baseColor || "#ff00ff");
                const intensity = state.glowIntensity || 0.5;
                r2 = baseColor[0] * intensity;
                g = baseColor[1] * intensity;
                b = baseColor[2] * intensity;
                if (intensity > 0.8) {
                  const whiteMix = (intensity - 0.8) * 5;
                  r2 = r2 + (255 - r2) * whiteMix * 0.3;
                  g = g + (255 - g) * whiteMix * 0.3;
                  b = b + (255 - b) * whiteMix * 0.3;
                }
                break;
              }
            }
          }
          this.renderer.setPixel(x, y, [r2, g, b]);
        }
      }
    }
    /**
     * Convert hex color to RGB array
     */
    _hexToRgb(hex) {
      if (!hex || hex === "#111" || hex === "#000")
        return [17, 17, 17];
      if (hex === "#050505")
        return [5, 5, 5];
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [17, 17, 17];
    }
  };

  // src/effects/index.js
  var EFFECT_CATEGORIES = {
    TEXT: "text",
    // Effects that modify displayed text
    AMBIENT: "ambient",
    // Standalone visual effects (ignore text)
    COLOR: "color"
    // Color modifications applied to text
  };
  var EFFECTS = {
    // Text effects - modify how text is displayed
    fixed: { category: EFFECT_CATEGORIES.TEXT, name: "Fixed", description: "Static display" },
    scroll_ltr: { category: EFFECT_CATEGORIES.TEXT, name: "Scroll Left", description: "Text scrolls left to right" },
    scroll_rtl: { category: EFFECT_CATEGORIES.TEXT, name: "Scroll Right", description: "Text scrolls right to left" },
    blink: { category: EFFECT_CATEGORIES.TEXT, name: "Blink", description: "Text blinks on/off" },
    breeze: { category: EFFECT_CATEGORIES.TEXT, name: "Breeze", description: "Gentle wave brightness" },
    snow: { category: EFFECT_CATEGORIES.TEXT, name: "Snow", description: "Sparkle effect" },
    laser: { category: EFFECT_CATEGORIES.TEXT, name: "Laser", description: "Scanning beam" },
    fade: { category: EFFECT_CATEGORIES.TEXT, name: "Fade", description: "Fade in/out" },
    typewriter: { category: EFFECT_CATEGORIES.TEXT, name: "Typewriter", description: "Characters appear one by one" },
    bounce: { category: EFFECT_CATEGORIES.TEXT, name: "Bounce", description: "Text bounces back and forth" },
    sparkle: { category: EFFECT_CATEGORIES.TEXT, name: "Sparkle", description: "Random sparkle overlay" },
    // Ambient effects - standalone visual displays
    rainbow: { category: EFFECT_CATEGORIES.AMBIENT, name: "Rainbow", description: "HSV rainbow gradient" },
    matrix: { category: EFFECT_CATEGORIES.AMBIENT, name: "Matrix", description: "Digital rain effect" },
    plasma: { category: EFFECT_CATEGORIES.AMBIENT, name: "Plasma", description: "Classic plasma waves" },
    gradient: { category: EFFECT_CATEGORIES.AMBIENT, name: "Gradient", description: "Moving color gradients" },
    fire: { category: EFFECT_CATEGORIES.AMBIENT, name: "Fire", description: "Fire/flame simulation" },
    water: { category: EFFECT_CATEGORIES.AMBIENT, name: "Water", description: "Ripple/wave effect" },
    stars: { category: EFFECT_CATEGORIES.AMBIENT, name: "Stars", description: "Twinkling starfield" },
    confetti: { category: EFFECT_CATEGORIES.AMBIENT, name: "Confetti", description: "Falling colored particles" },
    // Shader-inspired effects (ported from ipixel-shader GLSL)
    plasma_wave: { category: EFFECT_CATEGORIES.AMBIENT, name: "Plasma Wave", description: "Multi-frequency sine waves" },
    radial_pulse: { category: EFFECT_CATEGORIES.AMBIENT, name: "Radial Pulse", description: "Expanding ring patterns" },
    hypnotic: { category: EFFECT_CATEGORIES.AMBIENT, name: "Hypnotic", description: "Spiral pattern" },
    lava: { category: EFFECT_CATEGORIES.AMBIENT, name: "Lava", description: "Flowing lava/magma" },
    aurora: { category: EFFECT_CATEGORIES.AMBIENT, name: "Aurora", description: "Northern lights" },
    // Color effects - applied to text colors
    color_cycle: { category: EFFECT_CATEGORIES.COLOR, name: "Color Cycle", description: "Cycle through colors" },
    rainbow_text: { category: EFFECT_CATEGORIES.COLOR, name: "Rainbow Text", description: "Rainbow gradient on text" },
    neon: { category: EFFECT_CATEGORIES.COLOR, name: "Neon", description: "Pulsing neon glow" }
  };
  var EffectManager = class {
    constructor(renderer) {
      this.renderer = renderer;
      this.textEffects = new TextEffects(renderer);
      this.ambientEffects = new AmbientEffects(renderer);
      this.colorEffects = new ColorEffects(renderer);
      this.currentEffect = "fixed";
      this.effectState = {};
    }
    /**
     * Get effect metadata
     */
    getEffectInfo(effectName) {
      return EFFECTS[effectName] || EFFECTS.fixed;
    }
    /**
     * Get all effects by category
     */
    getEffectsByCategory(category) {
      return Object.entries(EFFECTS).filter(([_, info]) => info.category === category).map(([name, info]) => ({ name, ...info }));
    }
    /**
     * Initialize an effect
     */
    initEffect(effectName, options = {}) {
      const info = this.getEffectInfo(effectName);
      this.currentEffect = effectName;
      this.effectState = { tick: 0, ...options };
      switch (info.category) {
        case EFFECT_CATEGORIES.TEXT:
          this.textEffects.init(effectName, this.effectState);
          break;
        case EFFECT_CATEGORIES.AMBIENT:
          this.ambientEffects.init(effectName, this.effectState);
          break;
        case EFFECT_CATEGORIES.COLOR:
          this.colorEffects.init(effectName, this.effectState);
          break;
      }
      return this.effectState;
    }
    /**
     * Step the effect forward (called on frame interval)
     */
    step() {
      const info = this.getEffectInfo(this.currentEffect);
      this.effectState.tick = (this.effectState.tick || 0) + 1;
      switch (info.category) {
        case EFFECT_CATEGORIES.TEXT:
          this.textEffects.step(this.currentEffect, this.effectState);
          break;
        case EFFECT_CATEGORIES.AMBIENT:
          this.ambientEffects.step(this.currentEffect, this.effectState);
          break;
        case EFFECT_CATEGORIES.COLOR:
          this.colorEffects.step(this.currentEffect, this.effectState);
          break;
      }
    }
    /**
     * Render the current frame
     */
    render(pixels, extendedPixels, extendedWidth) {
      const info = this.getEffectInfo(this.currentEffect);
      switch (info.category) {
        case EFFECT_CATEGORIES.AMBIENT:
          this.ambientEffects.render(this.currentEffect, this.effectState);
          break;
        case EFFECT_CATEGORIES.TEXT:
          this.textEffects.render(this.currentEffect, this.effectState, pixels, extendedPixels, extendedWidth);
          break;
        case EFFECT_CATEGORIES.COLOR:
          this.colorEffects.render(this.currentEffect, this.effectState, pixels);
          break;
      }
    }
    /**
     * Check if effect is ambient (standalone, ignores text)
     */
    isAmbient(effectName) {
      return this.getEffectInfo(effectName).category === EFFECT_CATEGORIES.AMBIENT;
    }
    /**
     * Check if effect needs animation loop
     */
    needsAnimation(effectName) {
      return effectName !== "fixed";
    }
  };
  var TEXT_EFFECTS = Object.entries(EFFECTS).filter(([_, info]) => info.category === EFFECT_CATEGORIES.TEXT).map(([name]) => name);
  var AMBIENT_EFFECTS = Object.entries(EFFECTS).filter(([_, info]) => info.category === EFFECT_CATEGORIES.AMBIENT).map(([name]) => name);
  var COLOR_EFFECTS = Object.entries(EFFECTS).filter(([_, info]) => info.category === EFFECT_CATEGORIES.COLOR).map(([name]) => name);
  var ALL_EFFECTS = Object.keys(EFFECTS);

  // src/canvas-renderer.js
  var ImageDataLEDRenderer = class {
    constructor(container, options = {}) {
      this.container = container;
      this.width = options.width || 64;
      this.height = options.height || 16;
      this.pixelGap = options.pixelGap || 0.15;
      this.glowEnabled = options.glow !== false;
      this.scale = options.scale || 8;
      this.buffer = [];
      this._initBuffer();
      this._colorPixels = [];
      this._extendedColorPixels = [];
      this.extendedWidth = this.width;
      this.effect = "fixed";
      this.speed = 50;
      this.animationId = null;
      this.lastFrameTime = 0;
      this._isRunning = false;
      this._canvas = null;
      this._ctx = null;
      this._imageData = null;
      this._glowCanvas = null;
      this._glowCtx = null;
      this._wrapper = null;
      this._canvasCreated = false;
      this._pixelTemplate = null;
      this.effectManager = new EffectManager(this);
    }
    _initBuffer() {
      this.buffer = [];
      for (let i2 = 0; i2 < this.width * this.height; i2++) {
        this.buffer.push([0, 0, 0]);
      }
    }
    /**
     * Create canvas and pre-compute pixel template
     */
    _createCanvas() {
      const canvasWidth = this.width * this.scale;
      const canvasHeight = this.height * this.scale;
      this._wrapper = document.createElement("div");
      this._wrapper.style.cssText = `
      position: relative;
      width: 100%;
      aspect-ratio: ${this.width} / ${this.height};
      background: #0a0a0a;
      border-radius: 4px;
      overflow: hidden;
    `;
      if (this.glowEnabled) {
        this._glowCanvas = document.createElement("canvas");
        this._glowCanvas.width = canvasWidth;
        this._glowCanvas.height = canvasHeight;
        this._glowCanvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        filter: blur(${this.scale * 0.6}px);
        opacity: 0.5;
      `;
        this._glowCtx = this._glowCanvas.getContext("2d", { alpha: false });
        this._wrapper.appendChild(this._glowCanvas);
      }
      this._canvas = document.createElement("canvas");
      this._canvas.width = canvasWidth;
      this._canvas.height = canvasHeight;
      this._canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    `;
      this._ctx = this._canvas.getContext("2d", { alpha: false });
      this._wrapper.appendChild(this._canvas);
      this._imageData = this._ctx.createImageData(canvasWidth, canvasHeight);
      this._createPixelTemplate();
      this._fillBackground();
      if (this.container && this.container.isConnected !== false) {
        this.container.innerHTML = "";
        this.container.appendChild(this._wrapper);
      }
      this._canvasCreated = true;
    }
    /**
     * Create a template mask for LED pixels (with gaps and rounded corners)
     */
    _createPixelTemplate() {
      const scale = this.scale;
      const gap = Math.max(1, Math.floor(scale * this.pixelGap));
      const pixelSize = scale - gap;
      const radius = Math.max(1, Math.floor(scale * 0.15));
      this._pixelTemplate = [];
      for (let py = 0; py < scale; py++) {
        for (let px = 0; px < scale; px++) {
          let inside = false;
          if (px < pixelSize && py < pixelSize) {
            if (px < radius && py < radius) {
              const dx = radius - px;
              const dy = radius - py;
              inside = dx * dx + dy * dy <= radius * radius;
            } else if (px >= pixelSize - radius && py < radius) {
              const dx = px - (pixelSize - radius - 1);
              const dy = radius - py;
              inside = dx * dx + dy * dy <= radius * radius;
            } else if (px < radius && py >= pixelSize - radius) {
              const dx = radius - px;
              const dy = py - (pixelSize - radius - 1);
              inside = dx * dx + dy * dy <= radius * radius;
            } else if (px >= pixelSize - radius && py >= pixelSize - radius) {
              const dx = px - (pixelSize - radius - 1);
              const dy = py - (pixelSize - radius - 1);
              inside = dx * dx + dy * dy <= radius * radius;
            } else {
              inside = true;
            }
          }
          this._pixelTemplate.push(inside);
        }
      }
    }
    /**
     * Fill ImageData with background color
     */
    _fillBackground() {
      const data = this._imageData.data;
      const bgR = 10, bgG = 10, bgB = 10;
      for (let i2 = 0; i2 < data.length; i2 += 4) {
        data[i2] = bgR;
        data[i2 + 1] = bgG;
        data[i2 + 2] = bgB;
        data[i2 + 3] = 255;
      }
    }
    _ensureCanvasInContainer() {
      if (!this.container)
        return false;
      if (this._wrapper && this._wrapper.parentNode === this.container) {
        return true;
      }
      if (this._wrapper && this.container.isConnected !== false) {
        this.container.innerHTML = "";
        this.container.appendChild(this._wrapper);
        return true;
      }
      return false;
    }
    setPixel(x, y, color) {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        const idx = y * this.width + x;
        if (idx < this.buffer.length) {
          this.buffer[idx] = color;
        }
      }
    }
    clear() {
      for (let i2 = 0; i2 < this.buffer.length; i2++) {
        this.buffer[i2] = [0, 0, 0];
      }
    }
    /**
     * Flush buffer to canvas using ImageData (fastest method)
     */
    flush() {
      if (!this._canvasCreated) {
        this._createCanvas();
      } else if (!this._ensureCanvasInContainer()) {
        this._createCanvas();
      }
      const data = this._imageData.data;
      const scale = this.scale;
      const canvasWidth = this.width * scale;
      const template = this._pixelTemplate;
      const bgR = 10, bgG = 10, bgB = 10;
      for (let ledY = 0; ledY < this.height; ledY++) {
        for (let ledX = 0; ledX < this.width; ledX++) {
          const bufferIdx = ledY * this.width + ledX;
          const color = this.buffer[bufferIdx];
          if (!color || !Array.isArray(color))
            continue;
          const r2 = Math.round(color[0]);
          const g = Math.round(color[1]);
          const b = Math.round(color[2]);
          const baseX = ledX * scale;
          const baseY = ledY * scale;
          for (let py = 0; py < scale; py++) {
            for (let px = 0; px < scale; px++) {
              const templateIdx = py * scale + px;
              const canvasIdx = ((baseY + py) * canvasWidth + (baseX + px)) * 4;
              if (template[templateIdx]) {
                data[canvasIdx] = r2;
                data[canvasIdx + 1] = g;
                data[canvasIdx + 2] = b;
                data[canvasIdx + 3] = 255;
              } else {
                data[canvasIdx] = bgR;
                data[canvasIdx + 1] = bgG;
                data[canvasIdx + 2] = bgB;
                data[canvasIdx + 3] = 255;
              }
            }
          }
        }
      }
      this._ctx.putImageData(this._imageData, 0, 0);
      if (this.glowEnabled && this._glowCtx) {
        this._glowCtx.drawImage(this._canvas, 0, 0);
      }
    }
    setData(pixels, extendedPixels = null, extendedWidth = null) {
      this._colorPixels = pixels || [];
      if (extendedPixels) {
        this._extendedColorPixels = extendedPixels;
        this.extendedWidth = extendedWidth || this.width;
      } else {
        this._extendedColorPixels = pixels || [];
        this.extendedWidth = this.width;
      }
    }
    setEffect(effect, speed = 50) {
      const wasRunning = this._isRunning;
      if (this.effect !== effect) {
        this.effect = effect;
        this.effectManager.initEffect(effect, { speed });
      }
      this.speed = speed;
      if (wasRunning && effect !== "fixed") {
        this.start();
      }
    }
    start() {
      if (this._isRunning)
        return;
      this._isRunning = true;
      this.lastFrameTime = performance.now();
      this._animate();
    }
    stop() {
      this._isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
    get isRunning() {
      return this._isRunning;
    }
    _animate() {
      if (!this._isRunning)
        return;
      const now = performance.now();
      const frameInterval = 500 - (this.speed - 1) * 4.7;
      if (now - this.lastFrameTime >= frameInterval) {
        this.lastFrameTime = now;
        this.effectManager.step();
      }
      this._renderFrame();
      this.animationId = requestAnimationFrame(() => this._animate());
    }
    _renderFrame() {
      this.effectManager.render(
        this._colorPixels,
        this._extendedColorPixels,
        this.extendedWidth
      );
      this.flush();
    }
    renderStatic() {
      if (!this._canvasCreated) {
        this._createCanvas();
      }
      this._renderFrame();
    }
    setDimensions(width, height) {
      if (width !== this.width || height !== this.height) {
        this.width = width;
        this.height = height;
        this.extendedWidth = width;
        this._initBuffer();
        this._canvasCreated = false;
        this.effectManager = new EffectManager(this);
        if (this.effect !== "fixed") {
          this.effectManager.initEffect(this.effect, { speed: this.speed });
        }
      }
    }
    setContainer(container) {
      if (container !== this.container) {
        this.container = container;
        if (this._wrapper && container) {
          container.innerHTML = "";
          container.appendChild(this._wrapper);
        }
      }
    }
    destroy() {
      this.stop();
      this._canvas = null;
      this._ctx = null;
      this._imageData = null;
      this._glowCanvas = null;
      this._glowCtx = null;
      this._wrapper = null;
      this._canvasCreated = false;
      this._pixelTemplate = null;
    }
  };

  // src/state.js
  var IPIXEL_STORAGE_KEY = "iPIXEL_DisplayState";
  var DEFAULT_STATE = {
    text: "",
    mode: "text",
    effect: "fixed",
    speed: 50,
    fgColor: "#ff6600",
    bgColor: "#000000",
    font: "VCR_OSD_MONO",
    lastUpdate: 0
  };
  function loadDisplayState() {
    try {
      const saved = localStorage.getItem(IPIXEL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e2) {
      console.warn("iPIXEL: Could not load saved state", e2);
    }
    return { ...DEFAULT_STATE };
  }
  function saveDisplayState(state) {
    try {
      localStorage.setItem(IPIXEL_STORAGE_KEY, JSON.stringify(state));
    } catch (e2) {
      console.warn("iPIXEL: Could not save state", e2);
    }
  }
  if (!window.iPIXELDisplayState) {
    window.iPIXELDisplayState = loadDisplayState();
  }
  function getDisplayState() {
    return window.iPIXELDisplayState;
  }
  function updateDisplayState(updates) {
    window.iPIXELDisplayState = {
      ...window.iPIXELDisplayState,
      ...updates,
      lastUpdate: Date.now()
    };
    saveDisplayState(window.iPIXELDisplayState);
    window.dispatchEvent(new CustomEvent("ipixel-display-update", {
      detail: window.iPIXELDisplayState
    }));
    return window.iPIXELDisplayState;
  }

  // src/cards/display-card.js
  var rendererCache = /* @__PURE__ */ new Map();
  var iPIXELDisplayCard = class extends iPIXELCardBase {
    constructor() {
      super();
      this._renderer = null;
      this._displayContainer = null;
      this._lastState = null;
      this._cachedResolution = null;
      this._rendererId = null;
      this._handleDisplayUpdate = (e2) => {
        this._updateDisplay(e2.detail);
      };
      window.addEventListener("ipixel-display-update", this._handleDisplayUpdate);
    }
    connectedCallback() {
      if (!this._rendererId) {
        this._rendererId = `renderer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      if (rendererCache.has(this._rendererId)) {
        this._renderer = rendererCache.get(this._rendererId);
      }
      loadBdfFont("VCR_OSD_MONO", 16).then(() => {
        if (this._lastState)
          this._updateDisplay(this._lastState);
      });
      loadBdfFont("VCR_OSD_MONO", 24);
      loadBdfFont("VCR_OSD_MONO", 32);
      loadBdfFont("CUSONG", 16);
      loadBdfFont("CUSONG", 24);
      loadBdfFont("CUSONG", 32);
      loadFont("VCR_OSD_MONO");
      loadFont("CUSONG");
    }
    disconnectedCallback() {
      window.removeEventListener("ipixel-display-update", this._handleDisplayUpdate);
      if (this._renderer && this._rendererId) {
        this._renderer.stop();
        rendererCache.set(this._rendererId, this._renderer);
      }
    }
    /**
     * Get resolution with caching and fallback
     */
    _getResolutionCached() {
      const [sensorWidth, sensorHeight] = this.getResolution();
      if (sensorWidth > 0 && sensorHeight > 0 && sensorWidth !== 64) {
        this._cachedResolution = [sensorWidth, sensorHeight];
        try {
          localStorage.setItem("iPIXEL_Resolution", JSON.stringify([sensorWidth, sensorHeight]));
        } catch (e2) {
        }
        return this._cachedResolution;
      }
      try {
        const saved = localStorage.getItem("iPIXEL_Resolution");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === 2 && parsed[0] > 0 && parsed[1] > 0) {
            this._cachedResolution = parsed;
            return parsed;
          }
        }
      } catch (e2) {
      }
      if (this._cachedResolution) {
        return this._cachedResolution;
      }
      if (this._config?.width && this._config?.height) {
        return [this._config.width, this._config.height];
      }
      return [sensorWidth || 64, sensorHeight || 16];
    }
    /**
     * Update the display with new state
     */
    _updateDisplay(state) {
      if (!this._displayContainer)
        return;
      const [width, height] = this._getResolutionCached();
      const isOn = this.isOn();
      if (!this._renderer) {
        this._renderer = new ImageDataLEDRenderer(this._displayContainer, { width, height });
        if (this._rendererId) {
          rendererCache.set(this._rendererId, this._renderer);
        }
      } else {
        this._renderer.setContainer(this._displayContainer);
        if (this._renderer.width !== width || this._renderer.height !== height) {
          this._renderer.setDimensions(width, height);
        }
      }
      if (!isOn) {
        this._renderer.setData([]);
        this._renderer.setEffect("fixed", 50);
        this._renderer.stop();
        this._renderer.renderStatic();
        return;
      }
      const text = state?.text || "";
      const effect = state?.effect || "fixed";
      const speed = state?.speed || 50;
      const fgColor = state?.fgColor || "#ff6600";
      const bgColor = state?.bgColor || "#111";
      const mode = state?.mode || "text";
      const font = state?.font || "VCR_OSD_MONO";
      this._lastState = state;
      let displayText = text;
      let displayFg = fgColor;
      if (mode === "clock") {
        const now = /* @__PURE__ */ new Date();
        displayText = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
        displayFg = "#00ff88";
      } else if (mode === "gif") {
        displayText = "GIF";
        displayFg = "#ff44ff";
      } else if (mode === "rhythm") {
        displayText = "***";
        displayFg = "#44aaff";
      }
      const effectInfo = EFFECTS[effect];
      const isAmbient = effectInfo?.category === "ambient";
      if (isAmbient) {
        this._renderer.setData([], [], width);
      } else {
        const heightKey = getHeightKey2(height);
        const useBdfFont = font !== "LEGACY" && isBdfFontLoaded(font, heightKey);
        const useCanvasFont = font !== "LEGACY" && isFontLoaded(font);
        const getPixels = (text2, w, h2, fg, bg) => {
          if (useBdfFont) {
            const bdfPixels = textToPixelsBdf(text2, w, h2, fg, bg, font);
            if (bdfPixels)
              return bdfPixels;
          }
          if (useCanvasFont) {
            const canvasPixels = textToPixelsCanvas(text2, w, h2, fg, bg, font);
            if (canvasPixels)
              return canvasPixels;
          }
          return textToPixels(text2, w, h2, fg, bg);
        };
        const getScrollPixels = (text2, displayW, h2, fg, bg) => {
          if (useBdfFont) {
            const bdfResult = textToScrollPixelsBdf(text2, displayW, h2, fg, bg, font);
            if (bdfResult)
              return bdfResult;
          }
          if (useCanvasFont) {
            const canvasResult = textToScrollPixelsCanvas(text2, displayW, h2, fg, bg, font);
            if (canvasResult)
              return canvasResult;
          }
          return textToScrollPixels(text2, displayW, h2, fg, bg);
        };
        const textPixelWidth = useCanvasFont ? displayText.length * 10 : displayText.length * 6;
        const needsScroll = (effect === "scroll_ltr" || effect === "scroll_rtl" || effect === "bounce") && textPixelWidth > width;
        if (needsScroll) {
          const scrollResult = getScrollPixels(displayText, width, height, displayFg, bgColor);
          const displayPixels = getPixels(displayText, width, height, displayFg, bgColor);
          this._renderer.setData(displayPixels, scrollResult.pixels, scrollResult.width);
        } else {
          const pixels = getPixels(displayText, width, height, displayFg, bgColor);
          this._renderer.setData(pixels);
        }
      }
      this._renderer.setEffect(effect, speed);
      if (effect === "fixed") {
        this._renderer.stop();
        this._renderer.renderStatic();
      } else {
        this._renderer.start();
      }
    }
    render() {
      if (!this._hass)
        return;
      const [width, height] = this._getResolutionCached();
      const isOn = this.isOn();
      const name = this._config.name || this.getEntity()?.attributes?.friendly_name || "iPIXEL Display";
      const sharedState = getDisplayState();
      const textEntity = this.getEntity();
      const entityText = textEntity?.state || "";
      const modeEntity = this.getRelatedEntity("select", "_mode");
      const currentMode = modeEntity?.state || sharedState.mode || "text";
      const currentText = sharedState.text || entityText;
      const currentEffect = sharedState.effect || "fixed";
      const currentSpeed = sharedState.speed || 50;
      const fgColor = sharedState.fgColor || "#ff6600";
      const bgColor = sharedState.bgColor || "#111";
      const currentFont = sharedState.font || "VCR_OSD_MONO";
      const effectInfo = EFFECTS[currentEffect];
      const isAmbient = effectInfo?.category === "ambient";
      const textEffects = Object.entries(EFFECTS).filter(([_, info]) => info.category === "text").map(([name2, info]) => `<option value="${name2}">${info.name}</option>`).join("");
      const ambientEffects = Object.entries(EFFECTS).filter(([_, info]) => info.category === "ambient").map(([name2, info]) => `<option value="${name2}">${info.name}</option>`).join("");
      const colorEffects = Object.entries(EFFECTS).filter(([_, info]) => info.category === "color").map(([name2, info]) => `<option value="${name2}">${info.name}</option>`).join("");
      this.shadowRoot.innerHTML = `
      <style>${iPIXELCardStyles}
        .display-container { background: #000; border-radius: 8px; padding: 8px; border: 2px solid #222; }
        .display-screen {
          background: #000;
          border-radius: 4px;
          overflow: hidden;
          min-height: 60px;
        }
        .display-footer { display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75em; opacity: 0.6; }
        .mode-badge { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; text-transform: capitalize; }
        .effect-badge { background: rgba(100,149,237,0.2); padding: 2px 6px; border-radius: 3px; margin-left: 4px; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">
              <span class="status-dot ${isOn ? "" : "off"}"></span>
              ${name}
            </div>
            <button class="icon-btn ${isOn ? "active" : ""}" id="power-btn">
              <svg viewBox="0 0 24 24"><path d="M13,3H11V13H13V3M17.83,5.17L16.41,6.59C18.05,7.91 19,9.9 19,12A7,7 0 0,1 12,19A7,7 0 0,1 5,12C5,9.9 5.95,7.91 7.59,6.59L6.17,5.17C4.23,6.82 3,9.26 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,9.26 19.77,6.82 17.83,5.17Z"/></svg>
            </button>
          </div>
          <div class="display-container">
            <div class="display-screen" id="display-screen"></div>
            <div class="display-footer">
              <span>${width} x ${height}</span>
              <span>
                <span class="mode-badge">${isOn ? currentMode : "Off"}</span>
                ${isOn && currentEffect !== "fixed" ? `<span class="effect-badge">${EFFECTS[currentEffect]?.name || currentEffect}</span>` : ""}
              </span>
            </div>
          </div>
        </div>
      </ha-card>`;
      this._displayContainer = this.shadowRoot.getElementById("display-screen");
      this._updateDisplay({
        text: currentText,
        effect: currentEffect,
        speed: currentSpeed,
        fgColor,
        bgColor,
        mode: currentMode,
        font: currentFont
      });
      this._attachPowerButton();
    }
    _attachPowerButton() {
      this.shadowRoot.getElementById("power-btn")?.addEventListener("click", () => {
        let switchId = this._switchEntityId;
        if (!switchId) {
          const sw = this.getRelatedEntity("switch");
          if (sw) {
            this._switchEntityId = sw.entity_id;
            switchId = sw.entity_id;
          }
        }
        if (switchId && this._hass.states[switchId]) {
          this._hass.callService("switch", "toggle", { entity_id: switchId });
        } else {
          const allSwitches = Object.keys(this._hass.states).filter((e2) => e2.startsWith("switch."));
          const baseName = this._config.entity?.replace(/^[^.]+\./, "").replace(/_?(text|display|gif_url)$/i, "") || "";
          const match = allSwitches.find((s2) => s2.includes(baseName.substring(0, 10)));
          if (match) {
            this._switchEntityId = match;
            this._hass.callService("switch", "toggle", { entity_id: match });
          } else {
            console.warn("iPIXEL: No switch found. Entity:", this._config.entity, "Available:", allSwitches);
          }
        }
      });
    }
    static getConfigElement() {
      return document.createElement("ipixel-simple-editor");
    }
    static getStubConfig() {
      return { entity: "" };
    }
  };

  // src/cards/controls-card.js
  var CLOCK_STYLES = [
    { value: 1, name: "Style 1 (Digital)" },
    { value: 2, name: "Style 2 (Minimal)" },
    { value: 3, name: "Style 3 (Bold)" },
    { value: 4, name: "Style 4 (Retro)" },
    { value: 5, name: "Style 5 (Neon)" },
    { value: 6, name: "Style 6 (Matrix)" },
    { value: 7, name: "Style 7 (Classic)" },
    { value: 8, name: "Style 8 (Modern)" }
  ];
  var ANIMATION_MODES = [
    { value: 0, name: "Static" },
    { value: 1, name: "Scroll Left" },
    { value: 2, name: "Scroll Right" },
    { value: 3, name: "Scroll Up" },
    { value: 4, name: "Scroll Down" },
    { value: 5, name: "Flash" },
    { value: 6, name: "Fade In/Out" },
    { value: 7, name: "Bounce" }
  ];
  var iPIXELControlsCard = class extends iPIXELCardBase {
    constructor() {
      super();
      this._clockStyle = 1;
      this._is24Hour = true;
      this._showDate = false;
      this._upsideDown = false;
      this._animationMode = 0;
    }
    render() {
      if (!this._hass)
        return;
      const isOn = this.isOn();
      const upsideDownEntity = this.getRelatedEntity("switch", "_upside_down");
      if (upsideDownEntity) {
        this._upsideDown = upsideDownEntity.state === "on";
      }
      this.shadowRoot.innerHTML = `
      <style>${iPIXELCardStyles}
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }
        .toggle-label {
          font-size: 0.85em;
          color: var(--primary-text-color, #fff);
        }
        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .toggle-switch.active {
          background: var(--primary-color, #03a9f4);
        }
        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .toggle-switch.active::after {
          transform: translateX(20px);
        }
        .subsection {
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .subsection-title {
          font-size: 0.75em;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.6;
          margin-bottom: 8px;
        }
        .screen-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
        }
        .screen-btn {
          padding: 8px 4px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #fff);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8em;
          text-align: center;
          transition: all 0.2s;
        }
        .screen-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .screen-btn.active {
          background: var(--primary-color, #03a9f4);
          border-color: var(--primary-color, #03a9f4);
        }
        .screen-btn.delete {
          background: rgba(244,67,54,0.2);
          border-color: rgba(244,67,54,0.3);
          color: #f44336;
        }
        .screen-btn.delete:hover {
          background: rgba(244,67,54,0.4);
        }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .compact-row { display: flex; gap: 8px; align-items: center; }
        .compact-row select { flex: 1; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="section-title">Quick Actions</div>
          <div class="control-row">
            <div class="button-grid button-grid-4">
              <button class="icon-btn ${isOn ? "active" : ""}" data-action="power" title="Power">
                <svg viewBox="0 0 24 24"><path d="M13,3H11V13H13V3M17.83,5.17L16.41,6.59C18.05,7.91 19,9.9 19,12A7,7 0 0,1 12,19A7,7 0 0,1 5,12C5,9.9 5.95,7.91 7.59,6.59L6.17,5.17C4.23,6.82 3,9.26 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,9.26 19.77,6.82 17.83,5.17Z"/></svg>
              </button>
              <button class="icon-btn" data-action="clear" title="Clear">
                <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>
              </button>
              <button class="icon-btn" data-action="clock" title="Clock">
                <svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/></svg>
              </button>
              <button class="icon-btn" data-action="sync" title="Sync Time">
                <svg viewBox="0 0 24 24"><path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4M18.2,7.27L19.62,5.85C18.27,4.5 16.5,3.5 14.5,3.13V5.17C15.86,5.5 17.08,6.23 18.2,7.27M20,12H22A10,10 0 0,0 12,2V4A8,8 0 0,1 20,12M5.8,16.73L4.38,18.15C5.73,19.5 7.5,20.5 9.5,20.87V18.83C8.14,18.5 6.92,17.77 5.8,16.73M4,12H2A10,10 0 0,0 12,22V20A8,8 0 0,1 4,12Z"/></svg>
              </button>
            </div>
          </div>

          <div class="section-title">Brightness</div>
          <div class="control-row">
            <div class="slider-row">
              <input type="range" class="slider" id="brightness" min="1" max="100" value="50">
              <span class="slider-value" id="brightness-val">50%</span>
            </div>
          </div>

          <div class="section-title">Display Mode</div>
          <div class="control-row">
            <div class="button-grid button-grid-3">
              <button class="mode-btn" data-mode="textimage">Text+Image</button>
              <button class="mode-btn" data-mode="text">Text</button>
              <button class="mode-btn" data-mode="clock">Clock</button>
              <button class="mode-btn" data-mode="gif">GIF</button>
              <button class="mode-btn" data-mode="rhythm">Rhythm</button>
            </div>
          </div>

          <div class="section-title">Clock Settings</div>
          <div class="subsection">
            <div class="compact-row" style="margin-bottom: 12px;">
              <select class="dropdown" id="clock-style">
                ${CLOCK_STYLES.map((s2) => `<option value="${s2.value}"${s2.value === this._clockStyle ? " selected" : ""}>${s2.name}</option>`).join("")}
              </select>
              <button class="btn btn-primary" id="apply-clock-btn">Apply</button>
            </div>
            <div class="toggle-row">
              <span class="toggle-label">24-Hour Format</span>
              <div class="toggle-switch ${this._is24Hour ? "active" : ""}" id="toggle-24h"></div>
            </div>
            <div class="toggle-row">
              <span class="toggle-label">Show Date</span>
              <div class="toggle-switch ${this._showDate ? "active" : ""}" id="toggle-date"></div>
            </div>
          </div>

          <div class="section-title">Text Animation</div>
          <div class="control-row">
            <select class="dropdown" id="animation-mode">
              ${ANIMATION_MODES.map((m) => `<option value="${m.value}"${m.value === this._animationMode ? " selected" : ""}>${m.name}</option>`).join("")}
            </select>
          </div>

          <div class="section-title">Orientation & Display</div>
          <div class="two-col">
            <div>
              <div class="subsection-title">Rotation</div>
              <select class="dropdown" id="orientation">
                <option value="0">0\xB0 (Normal)</option>
                <option value="1">180\xB0</option>
              </select>
            </div>
            <div>
              <div class="subsection-title">Flip</div>
              <div class="toggle-row" style="padding: 4px 0;">
                <span class="toggle-label">Upside Down</span>
                <div class="toggle-switch ${this._upsideDown ? "active" : ""}" id="toggle-upside-down"></div>
              </div>
            </div>
          </div>

          <div class="section-title">Screen Slots</div>
          <div class="subsection">
            <div class="subsection-title">Select Screen (1-9)</div>
            <div class="screen-grid" style="margin-bottom: 12px;">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n2) => `<button class="screen-btn" data-screen="${n2}">${n2}</button>`).join("")}
            </div>
            <div class="subsection-title">Delete Screen</div>
            <div class="screen-grid">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n2) => `<button class="screen-btn delete" data-delete="${n2}">\xD7${n2}</button>`).join("")}
            </div>
          </div>

          <div class="section-title">Font Settings</div>
          <div class="subsection">
            <div class="two-col" style="margin-bottom: 12px;">
              <div>
                <div class="subsection-title">Size (1-128)</div>
                <input type="number" class="text-input" id="font-size" value="16" min="1" max="128" style="width: 100%;">
              </div>
              <div>
                <div class="subsection-title">Offset X, Y</div>
                <div style="display: flex; gap: 4px;">
                  <input type="number" class="text-input" id="font-offset-x" value="0" min="-64" max="64" style="width: 50%;">
                  <input type="number" class="text-input" id="font-offset-y" value="0" min="-32" max="32" style="width: 50%;">
                </div>
              </div>
            </div>
          </div>

          <div class="section-title">DIY Mode</div>
          <div class="control-row">
            <select class="dropdown" id="diy-mode">
              <option value="">-- Select Action --</option>
              <option value="1">Enter (Clear Display)</option>
              <option value="3">Enter (Preserve Content)</option>
              <option value="0">Exit (Keep Previous)</option>
              <option value="2">Exit (Keep Current)</option>
            </select>
          </div>

          <div class="section-title">Raw Command</div>
          <div class="control-row" style="margin-top: 8px;">
            <div style="display: flex; gap: 8px;">
              <input type="text" class="text-input" id="raw-command" placeholder="Raw hex (e.g., 05 00 07 01 01)" style="flex: 1;">
              <button class="btn btn-secondary" id="send-raw-btn">Send</button>
            </div>
          </div>
        </div>
      </ha-card>`;
      this._attachControlListeners();
    }
    _attachControlListeners() {
      this.shadowRoot.querySelectorAll("[data-action]").forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          const action = e2.currentTarget.dataset.action;
          if (action === "power") {
            const sw = this.getRelatedEntity("switch");
            if (sw) {
              this._hass.callService("switch", "toggle", { entity_id: sw.entity_id });
            }
          } else if (action === "clear") {
            updateDisplayState({ text: "", mode: "text", effect: "fixed", speed: 50, fgColor: "#ff6600", bgColor: "#000000" });
            this.callService("ipixel_color", "clear_pixels");
          } else if (action === "clock") {
            this._applyClockSettings();
          } else if (action === "sync") {
            this.callService("ipixel_color", "sync_time");
          }
        });
      });
      const slider = this.shadowRoot.getElementById("brightness");
      if (slider) {
        slider.style.setProperty("--value", `${slider.value}%`);
        slider.addEventListener("input", (e2) => {
          e2.target.style.setProperty("--value", `${e2.target.value}%`);
          this.shadowRoot.getElementById("brightness-val").textContent = `${e2.target.value}%`;
        });
        slider.addEventListener("change", (e2) => {
          this.callService("ipixel_color", "set_brightness", { level: parseInt(e2.target.value) });
        });
      }
      this.shadowRoot.querySelectorAll("[data-mode]").forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          const mode = e2.currentTarget.dataset.mode;
          const modeEntity = this.getRelatedEntity("select", "_mode");
          if (modeEntity) {
            this._hass.callService("select", "select_option", { entity_id: modeEntity.entity_id, option: mode });
          }
          const modeColors = {
            "text": "#ff6600",
            "textimage": "#ff6600",
            "clock": "#00ff88",
            "gif": "#ff44ff",
            "rhythm": "#44aaff"
          };
          updateDisplayState({
            mode,
            fgColor: modeColors[mode] || "#ff6600",
            text: mode === "clock" ? "" : window.iPIXELDisplayState?.text || ""
          });
          this.shadowRoot.querySelectorAll("[data-mode]").forEach((b) => b.classList.remove("active"));
          e2.currentTarget.classList.add("active");
        });
      });
      this.shadowRoot.getElementById("clock-style")?.addEventListener("change", (e2) => {
        this._clockStyle = parseInt(e2.target.value);
      });
      this.shadowRoot.getElementById("apply-clock-btn")?.addEventListener("click", () => {
        this._applyClockSettings();
      });
      this.shadowRoot.getElementById("toggle-24h")?.addEventListener("click", (e2) => {
        this._is24Hour = !this._is24Hour;
        e2.currentTarget.classList.toggle("active", this._is24Hour);
      });
      this.shadowRoot.getElementById("toggle-date")?.addEventListener("click", (e2) => {
        this._showDate = !this._showDate;
        e2.currentTarget.classList.toggle("active", this._showDate);
      });
      this.shadowRoot.getElementById("animation-mode")?.addEventListener("change", (e2) => {
        this._animationMode = parseInt(e2.target.value);
        updateDisplayState({ animationMode: this._animationMode });
        this.callService("ipixel_color", "set_animation_mode", { mode: this._animationMode });
      });
      this.shadowRoot.getElementById("orientation")?.addEventListener("change", (e2) => {
        const orientation = parseInt(e2.target.value);
        this.callService("ipixel_color", "set_orientation", { orientation });
      });
      this.shadowRoot.getElementById("toggle-upside-down")?.addEventListener("click", (e2) => {
        this._upsideDown = !this._upsideDown;
        e2.currentTarget.classList.toggle("active", this._upsideDown);
        const upsideDownEntity = this.getRelatedEntity("switch", "_upside_down");
        if (upsideDownEntity) {
          this._hass.callService("switch", this._upsideDown ? "turn_on" : "turn_off", {
            entity_id: upsideDownEntity.entity_id
          });
        } else {
          this.callService("ipixel_color", "set_upside_down", { enabled: this._upsideDown });
        }
      });
      this.shadowRoot.querySelectorAll("[data-screen]").forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          const screen = parseInt(e2.currentTarget.dataset.screen);
          this.callService("ipixel_color", "set_screen", { screen });
          this.shadowRoot.querySelectorAll("[data-screen]").forEach((b) => b.classList.remove("active"));
          e2.currentTarget.classList.add("active");
        });
      });
      this.shadowRoot.querySelectorAll("[data-delete]").forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          const slot = parseInt(e2.currentTarget.dataset.delete);
          if (confirm(`Delete screen slot ${slot}?`)) {
            this.callService("ipixel_color", "delete_screen", { slot });
          }
        });
      });
      this.shadowRoot.getElementById("font-size")?.addEventListener("change", (e2) => {
        const size = parseInt(e2.target.value);
        updateDisplayState({ fontSize: size });
        this.callService("ipixel_color", "set_font_size", { size });
      });
      this.shadowRoot.getElementById("font-offset-x")?.addEventListener("change", () => {
        this._updateFontOffset();
      });
      this.shadowRoot.getElementById("font-offset-y")?.addEventListener("change", () => {
        this._updateFontOffset();
      });
      this.shadowRoot.getElementById("diy-mode")?.addEventListener("change", (e2) => {
        const mode = e2.target.value;
        if (mode !== "") {
          this.callService("ipixel_color", "set_diy_mode", { mode });
          setTimeout(() => {
            e2.target.value = "";
          }, 500);
        }
      });
      this.shadowRoot.getElementById("send-raw-btn")?.addEventListener("click", () => {
        const hexData = this.shadowRoot.getElementById("raw-command")?.value;
        if (hexData && hexData.trim()) {
          this.callService("ipixel_color", "send_raw_command", { hex_data: hexData.trim() });
        }
      });
      this.shadowRoot.getElementById("raw-command")?.addEventListener("keypress", (e2) => {
        if (e2.key === "Enter") {
          const hexData = e2.target.value;
          if (hexData && hexData.trim()) {
            this.callService("ipixel_color", "send_raw_command", { hex_data: hexData.trim() });
          }
        }
      });
    }
    _applyClockSettings() {
      updateDisplayState({
        text: "",
        mode: "clock",
        effect: "fixed",
        speed: 50,
        fgColor: "#00ff88",
        bgColor: "#000000",
        clockStyle: this._clockStyle,
        is24Hour: this._is24Hour,
        showDate: this._showDate
      });
      this.callService("ipixel_color", "set_clock_mode", {
        style: this._clockStyle,
        format_24h: this._is24Hour,
        show_date: this._showDate
      });
    }
    _updateFontOffset() {
      const x = parseInt(this.shadowRoot.getElementById("font-offset-x")?.value || "0");
      const y = parseInt(this.shadowRoot.getElementById("font-offset-y")?.value || "0");
      updateDisplayState({ fontOffsetX: x, fontOffsetY: y });
      this.callService("ipixel_color", "set_font_offset", { x, y });
    }
    static getConfigElement() {
      return document.createElement("ipixel-simple-editor");
    }
    static getStubConfig() {
      return { entity: "" };
    }
  };

  // src/cards/text-card.js
  var RAINBOW_MODES = [
    { value: 0, name: "None" },
    { value: 1, name: "Rainbow Wave" },
    { value: 2, name: "Rainbow Cycle" },
    { value: 3, name: "Rainbow Pulse" },
    { value: 4, name: "Rainbow Fade" },
    { value: 5, name: "Rainbow Chase" },
    { value: 6, name: "Rainbow Sparkle" },
    { value: 7, name: "Rainbow Gradient" },
    { value: 8, name: "Rainbow Theater" },
    { value: 9, name: "Rainbow Fire" }
  ];
  var RHYTHM_STYLES = [
    { value: 0, name: "Classic Bars" },
    { value: 1, name: "Mirrored Bars" },
    { value: 2, name: "Center Out" },
    { value: 3, name: "Wave Style" },
    { value: 4, name: "Particle Style" }
  ];
  var iPIXELTextCard = class extends iPIXELCardBase {
    constructor() {
      super();
      this._activeTab = "text";
      this._rhythmLevels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      this._selectedRhythmStyle = 0;
      this._selectedAmbient = "rainbow";
    }
    /**
     * Generate text effect options (text + color effects)
     */
    _buildTextEffectOptions() {
      const textEffects = Object.entries(EFFECTS).filter(([_, info]) => info.category === EFFECT_CATEGORIES.TEXT).map(([name, info]) => `<option value="${name}">${info.name}</option>`).join("");
      const colorEffects = Object.entries(EFFECTS).filter(([_, info]) => info.category === EFFECT_CATEGORIES.COLOR).map(([name, info]) => `<option value="${name}">${info.name}</option>`).join("");
      return `
      <optgroup label="Text Effects">
        ${textEffects}
      </optgroup>
      <optgroup label="Color Effects">
        ${colorEffects}
      </optgroup>
    `;
    }
    /**
     * Generate ambient effect options
     */
    _buildAmbientEffectOptions() {
      return Object.entries(EFFECTS).filter(([_, info]) => info.category === EFFECT_CATEGORIES.AMBIENT).map(([name, info]) => `<option value="${name}">${info.name}</option>`).join("");
    }
    /**
     * Build ambient effects as a button grid
     */
    _buildAmbientGrid() {
      const selected = this._selectedAmbient || "rainbow";
      return Object.entries(EFFECTS).filter(([_, info]) => info.category === EFFECT_CATEGORIES.AMBIENT).map(([name, info]) => `
        <button class="effect-btn ${name === selected ? "active" : ""}" data-effect="${name}">
          ${info.name}
        </button>
      `).join("");
    }
    /**
     * Build rainbow mode options for dropdown
     */
    _buildRainbowOptions() {
      return RAINBOW_MODES.map(
        (mode) => `<option value="${mode.value}">${mode.name}</option>`
      ).join("");
    }
    /**
     * Build rhythm style grid
     */
    _buildRhythmStyleGrid() {
      const selected = this._selectedRhythmStyle || 0;
      return RHYTHM_STYLES.map((style) => `
      <button class="style-btn ${style.value === selected ? "active" : ""}" data-style="${style.value}">
        ${style.name}
      </button>
    `).join("");
    }
    /**
     * Build rhythm level sliders (11 frequency bands)
     */
    _buildRhythmLevelSliders() {
      const labels = ["32Hz", "64Hz", "125Hz", "250Hz", "500Hz", "1kHz", "2kHz", "4kHz", "8kHz", "12kHz", "16kHz"];
      return this._rhythmLevels.map((level, i2) => `
      <div class="rhythm-band">
        <label>${labels[i2]}</label>
        <input type="range" class="rhythm-slider" data-band="${i2}" min="0" max="15" value="${level}">
        <span class="rhythm-val">${level}</span>
      </div>
    `).join("");
    }
    render() {
      if (!this._hass)
        return;
      const isTextTab = this._activeTab === "text";
      const isAmbientTab = this._activeTab === "ambient";
      const isRhythmTab = this._activeTab === "rhythm";
      const isAdvancedTab = this._activeTab === "advanced";
      this.shadowRoot.innerHTML = `
      <style>${iPIXELCardStyles}
        .tabs { display: flex; gap: 4px; margin-bottom: 16px; }
        .tab {
          flex: 1;
          padding: 10px 8px;
          border: none;
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #fff);
          cursor: pointer;
          border-radius: 8px;
          font-size: 0.8em;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .tab:hover { background: rgba(255,255,255,0.1); }
        .tab.active {
          background: var(--primary-color, #03a9f4);
          color: #fff;
        }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .input-row { display: flex; gap: 8px; margin-bottom: 12px; }
        .input-row .text-input { flex: 1; }
        select optgroup { font-weight: bold; color: var(--primary-text-color, #fff); }
        select option { font-weight: normal; }
        .effect-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .effect-btn, .style-btn {
          padding: 12px 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: var(--primary-text-color, #fff);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.75em;
          text-align: center;
          transition: all 0.2s ease;
        }
        .effect-btn:hover, .style-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .effect-btn.active, .style-btn.active {
          background: var(--primary-color, #03a9f4);
          border-color: var(--primary-color, #03a9f4);
        }
        .style-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .rhythm-band {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .rhythm-band label {
          width: 50px;
          font-size: 0.75em;
          opacity: 0.8;
        }
        .rhythm-slider {
          flex: 1;
          height: 4px;
        }
        .rhythm-val {
          width: 20px;
          font-size: 0.75em;
          text-align: right;
        }
        .rhythm-container {
          max-height: 300px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .gfx-textarea {
          width: 100%;
          min-height: 150px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: var(--primary-text-color, #fff);
          font-family: monospace;
          font-size: 0.8em;
          padding: 12px;
          resize: vertical;
        }
        .gfx-textarea:focus {
          outline: none;
          border-color: var(--primary-color, #03a9f4);
        }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="tabs">
            <button class="tab ${isTextTab ? "active" : ""}" id="tab-text">Text</button>
            <button class="tab ${isAmbientTab ? "active" : ""}" id="tab-ambient">Ambient</button>
            <button class="tab ${isRhythmTab ? "active" : ""}" id="tab-rhythm">Rhythm</button>
            <button class="tab ${isAdvancedTab ? "active" : ""}" id="tab-advanced">GFX</button>
          </div>

          <!-- Text Tab -->
          <div class="tab-content ${isTextTab ? "active" : ""}" id="content-text">
            <div class="section-title">Display Text</div>
            <div class="input-row">
              <input type="text" class="text-input" id="text-input" placeholder="Enter text to display...">
              <button class="btn btn-primary" id="send-btn">Send</button>
            </div>
            <div class="two-col">
              <div>
                <div class="section-title">Effect</div>
                <div class="control-row">
                  <select class="dropdown" id="text-effect">
                    ${this._buildTextEffectOptions()}
                  </select>
                </div>
              </div>
              <div>
                <div class="section-title">Rainbow Mode</div>
                <div class="control-row">
                  <select class="dropdown" id="rainbow-mode">
                    ${this._buildRainbowOptions()}
                  </select>
                </div>
              </div>
            </div>
            <div class="section-title">Speed</div>
            <div class="control-row">
              <div class="slider-row">
                <input type="range" class="slider" id="text-speed" min="1" max="100" value="50">
                <span class="slider-value" id="text-speed-val">50</span>
              </div>
            </div>
            <div class="section-title">Font</div>
            <div class="control-row">
              <select class="dropdown" id="font-select">
                <option value="VCR_OSD_MONO">VCR OSD Mono</option>
                <option value="CUSONG">CUSONG</option>
                <option value="LEGACY">Legacy (Bitmap)</option>
              </select>
            </div>
            <div class="section-title">Colors</div>
            <div class="control-row">
              <div class="color-row">
                <span style="font-size: 0.85em;">Text:</span>
                <input type="color" class="color-picker" id="text-color" value="#ff6600">
                <span style="font-size: 0.85em; margin-left: 16px;">Background:</span>
                <input type="color" class="color-picker" id="bg-color" value="#000000">
              </div>
            </div>
          </div>

          <!-- Ambient Tab -->
          <div class="tab-content ${isAmbientTab ? "active" : ""}" id="content-ambient">
            <div class="section-title">Ambient Effect</div>
            <div class="effect-grid" id="ambient-grid">
              ${this._buildAmbientGrid()}
            </div>
            <div class="section-title">Speed</div>
            <div class="control-row">
              <div class="slider-row">
                <input type="range" class="slider" id="ambient-speed" min="1" max="100" value="50">
                <span class="slider-value" id="ambient-speed-val">50</span>
              </div>
            </div>
            <button class="btn btn-primary" id="apply-ambient-btn" style="width: 100%; margin-top: 8px;">Apply Effect</button>
          </div>

          <!-- Rhythm Tab -->
          <div class="tab-content ${isRhythmTab ? "active" : ""}" id="content-rhythm">
            <div class="section-title">Visualization Style</div>
            <div class="style-grid" id="rhythm-style-grid">
              ${this._buildRhythmStyleGrid()}
            </div>
            <div class="section-title">Frequency Levels (0-15)</div>
            <div class="rhythm-container">
              ${this._buildRhythmLevelSliders()}
            </div>
            <button class="btn btn-primary" id="apply-rhythm-btn" style="width: 100%; margin-top: 12px;">Apply Rhythm</button>
          </div>

          <!-- Advanced/GFX Tab -->
          <div class="tab-content ${isAdvancedTab ? "active" : ""}" id="content-advanced">
            <div class="section-title">GFX JSON Data</div>
            <textarea class="gfx-textarea" id="gfx-json" placeholder='Enter GFX JSON data...
Example:
{
  "width": 64,
  "height": 16,
  "pixels": [
    {"x": 0, "y": 0, "color": "#ff0000"},
    {"x": 1, "y": 0, "color": "#00ff00"}
  ]
}'></textarea>
            <button class="btn btn-primary" id="apply-gfx-btn" style="width: 100%; margin-top: 12px;">Render GFX</button>
            <div class="section-title" style="margin-top: 16px;">Per-Character Colors</div>
            <div class="input-row">
              <input type="text" class="text-input" id="multicolor-text" placeholder="Text (e.g., HELLO)">
            </div>
            <div class="input-row">
              <input type="text" class="text-input" id="multicolor-colors" placeholder="Colors (e.g., #ff0000,#00ff00,#0000ff)">
            </div>
            <button class="btn btn-primary" id="apply-multicolor-btn" style="width: 100%; margin-top: 8px;">Send Multicolor Text</button>
          </div>
        </div>
      </ha-card>`;
      this._attachListeners();
    }
    /**
     * Get text tab form values
     */
    _getTextFormValues() {
      return {
        text: this.shadowRoot.getElementById("text-input")?.value || "",
        effect: this.shadowRoot.getElementById("text-effect")?.value || "fixed",
        rainbowMode: parseInt(this.shadowRoot.getElementById("rainbow-mode")?.value || "0"),
        speed: parseInt(this.shadowRoot.getElementById("text-speed")?.value || "50"),
        fgColor: this.shadowRoot.getElementById("text-color")?.value || "#ff6600",
        bgColor: this.shadowRoot.getElementById("bg-color")?.value || "#000000",
        font: this.shadowRoot.getElementById("font-select")?.value || "VCR_OSD_MONO"
      };
    }
    /**
     * Get rhythm tab form values
     */
    _getRhythmFormValues() {
      return {
        style: this._selectedRhythmStyle || 0,
        levels: [...this._rhythmLevels]
      };
    }
    /**
     * Get GFX/advanced tab form values
     */
    _getGfxFormValues() {
      const jsonText = this.shadowRoot.getElementById("gfx-json")?.value || "";
      try {
        return JSON.parse(jsonText);
      } catch (e2) {
        return null;
      }
    }
    /**
     * Get multicolor text form values
     */
    _getMulticolorFormValues() {
      const text = this.shadowRoot.getElementById("multicolor-text")?.value || "";
      const colorsStr = this.shadowRoot.getElementById("multicolor-colors")?.value || "";
      const colors = colorsStr.split(",").map((c) => c.trim()).filter((c) => c);
      return { text, colors };
    }
    /**
     * Get ambient tab form values
     */
    _getAmbientFormValues() {
      return {
        effect: this._selectedAmbient || "rainbow",
        speed: parseInt(this.shadowRoot.getElementById("ambient-speed")?.value || "50")
      };
    }
    /**
     * Update text preview (without sending to device)
     */
    _updateTextPreview() {
      const { text, effect, speed, fgColor, bgColor, font } = this._getTextFormValues();
      updateDisplayState({
        text: text || "Preview",
        mode: "text",
        effect,
        speed,
        fgColor,
        bgColor,
        font
      });
    }
    /**
     * Update ambient preview
     */
    _updateAmbientPreview() {
      const { effect, speed } = this._getAmbientFormValues();
      updateDisplayState({
        text: "",
        mode: "ambient",
        effect,
        speed,
        fgColor: "#ffffff",
        bgColor: "#000000"
      });
    }
    _attachListeners() {
      this.shadowRoot.getElementById("tab-text")?.addEventListener("click", () => {
        this._activeTab = "text";
        this.render();
      });
      this.shadowRoot.getElementById("tab-ambient")?.addEventListener("click", () => {
        this._activeTab = "ambient";
        this.render();
      });
      this.shadowRoot.getElementById("tab-rhythm")?.addEventListener("click", () => {
        this._activeTab = "rhythm";
        this.render();
      });
      this.shadowRoot.getElementById("tab-advanced")?.addEventListener("click", () => {
        this._activeTab = "advanced";
        this.render();
      });
      const textSpeed = this.shadowRoot.getElementById("text-speed");
      if (textSpeed) {
        textSpeed.style.setProperty("--value", `${textSpeed.value}%`);
        textSpeed.addEventListener("input", (e2) => {
          e2.target.style.setProperty("--value", `${e2.target.value}%`);
          this.shadowRoot.getElementById("text-speed-val").textContent = e2.target.value;
          this._updateTextPreview();
        });
      }
      this.shadowRoot.getElementById("text-effect")?.addEventListener("change", () => {
        this._updateTextPreview();
      });
      this.shadowRoot.getElementById("rainbow-mode")?.addEventListener("change", () => {
        this._updateTextPreview();
      });
      this.shadowRoot.getElementById("font-select")?.addEventListener("change", () => {
        this._updateTextPreview();
      });
      this.shadowRoot.getElementById("text-color")?.addEventListener("input", () => {
        this._updateTextPreview();
      });
      this.shadowRoot.getElementById("bg-color")?.addEventListener("input", () => {
        this._updateTextPreview();
      });
      this.shadowRoot.getElementById("text-input")?.addEventListener("input", () => {
        this._updateTextPreview();
      });
      this.shadowRoot.getElementById("send-btn")?.addEventListener("click", () => {
        const { text, effect, rainbowMode, speed, fgColor, bgColor, font } = this._getTextFormValues();
        if (text) {
          updateDisplayState({
            text,
            mode: "text",
            effect,
            speed,
            fgColor,
            bgColor,
            font,
            rainbowMode
          });
          if (this._config.entity) {
            this._hass.callService("text", "set_value", {
              entity_id: this._config.entity,
              value: text
            });
          }
          const backendFont = font === "LEGACY" ? "CUSONG" : font;
          this.callService("ipixel_color", "display_text", {
            text,
            effect,
            speed,
            color_fg: this.hexToRgb(fgColor),
            color_bg: this.hexToRgb(bgColor),
            font: backendFont,
            rainbow_mode: rainbowMode
          });
        }
      });
      this.shadowRoot.querySelectorAll(".effect-btn").forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          const effect = e2.target.dataset.effect;
          this._selectedAmbient = effect;
          this.shadowRoot.querySelectorAll(".effect-btn").forEach((b) => b.classList.remove("active"));
          e2.target.classList.add("active");
          this._updateAmbientPreview();
        });
      });
      const ambientSpeed = this.shadowRoot.getElementById("ambient-speed");
      if (ambientSpeed) {
        ambientSpeed.style.setProperty("--value", `${ambientSpeed.value}%`);
        ambientSpeed.addEventListener("input", (e2) => {
          e2.target.style.setProperty("--value", `${e2.target.value}%`);
          this.shadowRoot.getElementById("ambient-speed-val").textContent = e2.target.value;
          this._updateAmbientPreview();
        });
      }
      this.shadowRoot.getElementById("apply-ambient-btn")?.addEventListener("click", () => {
        const { effect, speed } = this._getAmbientFormValues();
        updateDisplayState({
          text: "",
          mode: "ambient",
          effect,
          speed,
          fgColor: "#ffffff",
          bgColor: "#000000"
        });
      });
      this.shadowRoot.querySelectorAll(".style-btn").forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          const style = parseInt(e2.target.dataset.style);
          this._selectedRhythmStyle = style;
          this.shadowRoot.querySelectorAll(".style-btn").forEach((b) => b.classList.remove("active"));
          e2.target.classList.add("active");
        });
      });
      this.shadowRoot.querySelectorAll(".rhythm-slider").forEach((slider) => {
        slider.addEventListener("input", (e2) => {
          const band = parseInt(e2.target.dataset.band);
          const value = parseInt(e2.target.value);
          this._rhythmLevels[band] = value;
          e2.target.nextElementSibling.textContent = value;
        });
      });
      this.shadowRoot.getElementById("apply-rhythm-btn")?.addEventListener("click", () => {
        const { style, levels } = this._getRhythmFormValues();
        updateDisplayState({
          text: "",
          mode: "rhythm",
          rhythmStyle: style,
          rhythmLevels: levels
        });
        this.callService("ipixel_color", "set_rhythm_level", {
          style,
          levels
        });
      });
      this.shadowRoot.getElementById("apply-gfx-btn")?.addEventListener("click", () => {
        const gfxData = this._getGfxFormValues();
        if (!gfxData) {
          console.warn("iPIXEL: Invalid GFX JSON");
          return;
        }
        updateDisplayState({
          text: "",
          mode: "gfx",
          gfxData
        });
        this.callService("ipixel_color", "render_gfx", {
          data: gfxData
        });
      });
      this.shadowRoot.getElementById("apply-multicolor-btn")?.addEventListener("click", () => {
        const { text, colors } = this._getMulticolorFormValues();
        if (text && colors.length > 0) {
          updateDisplayState({
            text,
            mode: "multicolor",
            colors
          });
          this.callService("ipixel_color", "display_multicolor_text", {
            text,
            colors: colors.map((c) => this.hexToRgb(c))
          });
        }
      });
    }
    static getConfigElement() {
      return document.createElement("ipixel-simple-editor");
    }
    static getStubConfig() {
      return { entity: "" };
    }
  };

  // src/cards/playlist-card.js
  var PRESETS_STORAGE_KEY = "iPIXEL_Presets";
  var iPIXELPlaylistCard = class extends iPIXELCardBase {
    constructor() {
      super();
      this._presets = this._loadPresets();
      this._editingPreset = null;
      this._selectedIcon = "\u{1F4FA}";
    }
    _loadPresets() {
      try {
        const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (e2) {
        return [];
      }
    }
    _savePresets() {
      try {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(this._presets));
      } catch (e2) {
        console.warn("iPIXEL: Failed to save presets", e2);
      }
    }
    render() {
      if (!this._hass)
        return;
      this.shadowRoot.innerHTML = `
      <style>${iPIXELCardStyles}
        .preset-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          max-height: 300px;
          overflow-y: auto;
        }
        .preset-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: all 0.2s;
        }
        .preset-item:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        .preset-item.active {
          border-color: var(--primary-color, #03a9f4);
          background: rgba(3, 169, 244, 0.1);
        }
        .preset-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2em;
        }
        .preset-info {
          flex: 1;
          min-width: 0;
        }
        .preset-name {
          font-weight: 500;
          font-size: 0.9em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .preset-desc {
          font-size: 0.75em;
          opacity: 0.6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .preset-actions {
          display: flex;
          gap: 4px;
        }
        .preset-actions button {
          padding: 6px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .preset-actions button:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .preset-actions button.delete:hover {
          background: rgba(244,67,54,0.2);
          color: #f44;
        }
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          opacity: 0.5;
        }
        .empty-state svg {
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }
        .add-preset-form {
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 16px;
        }
        .form-row {
          margin-bottom: 12px;
        }
        .form-row label {
          display: block;
          font-size: 0.8em;
          opacity: 0.7;
          margin-bottom: 4px;
        }
        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .icon-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
          margin-top: 8px;
        }
        .icon-option {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1em;
          transition: all 0.2s;
          background: transparent;
        }
        .icon-option:hover {
          background: rgba(255,255,255,0.1);
        }
        .icon-option.selected {
          border-color: var(--primary-color, #03a9f4);
          background: rgba(3, 169, 244, 0.2);
        }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">Presets</div>
            <button class="icon-btn" id="add-preset-btn" title="Save Current as Preset">
              <svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>
            </button>
          </div>

          <div class="preset-list" id="preset-list">
            ${this._presets.length === 0 ? `
              <div class="empty-state">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z"/></svg>
                <div>No presets saved</div>
                <div style="font-size: 0.85em; margin-top: 4px;">Click + to save current display</div>
              </div>
            ` : this._presets.map((preset, i2) => `
              <div class="preset-item" data-index="${i2}">
                <div class="preset-icon" style="background: ${preset.fgColor || "#ff6600"}20; color: ${preset.fgColor || "#ff6600"}">
                  ${preset.icon || "\u{1F4FA}"}
                </div>
                <div class="preset-info">
                  <div class="preset-name">${this._escapeHtml(preset.name)}</div>
                  <div class="preset-desc">${preset.mode} \xB7 ${preset.effect || "fixed"}${preset.text ? ' \xB7 "' + preset.text.substring(0, 15) + (preset.text.length > 15 ? "..." : "") + '"' : ""}</div>
                </div>
                <div class="preset-actions">
                  <button class="edit" data-action="edit" data-index="${i2}" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                  </button>
                  <button class="delete" data-action="delete" data-index="${i2}" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                  </button>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="add-preset-form" id="preset-form" style="display: none;">
            <div class="form-row">
              <label>Preset Name</label>
              <input type="text" class="text-input" id="preset-name" placeholder="My Preset">
            </div>
            <div class="form-row">
              <label>Icon</label>
              <div class="icon-grid" id="icon-grid">
                ${["\u{1F4FA}", "\u{1F4AC}", "\u23F0", "\u{1F3B5}", "\u{1F3A8}", "\u2B50", "\u2764\uFE0F", "\u{1F525}", "\u{1F4A1}", "\u{1F308}", "\u{1F3AE}", "\u{1F4E2}", "\u{1F3E0}", "\u{1F514}", "\u2728", "\u{1F389}"].map((icon) => `
                  <button type="button" class="icon-option${icon === this._selectedIcon ? " selected" : ""}" data-icon="${icon}">${icon}</button>
                `).join("")}
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary" id="cancel-preset-btn">Cancel</button>
              <button class="btn btn-primary" id="save-preset-btn">Save Preset</button>
            </div>
          </div>
        </div>
      </ha-card>`;
      this._attachListeners();
    }
    _escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
    _attachListeners() {
      this.shadowRoot.getElementById("add-preset-btn")?.addEventListener("click", () => {
        this._editingPreset = null;
        this._selectedIcon = "\u{1F4FA}";
        this.shadowRoot.getElementById("preset-form").style.display = "block";
        this.shadowRoot.getElementById("preset-name").value = "";
        this.shadowRoot.querySelectorAll(".icon-option").forEach((o2) => o2.classList.remove("selected"));
        this.shadowRoot.querySelector(".icon-option")?.classList.add("selected");
      });
      this.shadowRoot.getElementById("cancel-preset-btn")?.addEventListener("click", () => {
        this.shadowRoot.getElementById("preset-form").style.display = "none";
        this._editingPreset = null;
      });
      this.shadowRoot.getElementById("save-preset-btn")?.addEventListener("click", () => {
        const name = this.shadowRoot.getElementById("preset-name").value.trim() || "Preset";
        const selectedIcon = this.shadowRoot.querySelector(".icon-option.selected");
        const icon = selectedIcon?.dataset.icon || "\u{1F4FA}";
        const currentState = getDisplayState();
        const preset = {
          name,
          icon,
          text: currentState.text || "",
          mode: currentState.mode || "text",
          effect: currentState.effect || "fixed",
          speed: currentState.speed || 50,
          fgColor: currentState.fgColor || "#ff6600",
          bgColor: currentState.bgColor || "#000000",
          font: currentState.font || "VCR_OSD_MONO",
          rainbowMode: currentState.rainbowMode || 0,
          createdAt: Date.now()
        };
        if (this._editingPreset !== null) {
          this._presets[this._editingPreset] = preset;
        } else {
          this._presets.push(preset);
        }
        this._savePresets();
        this.shadowRoot.getElementById("preset-form").style.display = "none";
        this._editingPreset = null;
        this.render();
      });
      this.shadowRoot.querySelectorAll(".icon-option").forEach((opt) => {
        opt.addEventListener("click", (e2) => {
          this.shadowRoot.querySelectorAll(".icon-option").forEach((o2) => o2.classList.remove("selected"));
          e2.currentTarget.classList.add("selected");
          this._selectedIcon = e2.currentTarget.dataset.icon;
        });
      });
      this.shadowRoot.querySelectorAll(".preset-item").forEach((item) => {
        item.addEventListener("click", (e2) => {
          if (e2.target.closest(".preset-actions"))
            return;
          const index = parseInt(item.dataset.index);
          const preset = this._presets[index];
          if (preset) {
            updateDisplayState({
              text: preset.text,
              mode: preset.mode,
              effect: preset.effect,
              speed: preset.speed,
              fgColor: preset.fgColor,
              bgColor: preset.bgColor,
              font: preset.font,
              rainbowMode: preset.rainbowMode
            });
            if (preset.mode === "text" && preset.text) {
              this.callService("ipixel_color", "display_text", {
                text: preset.text,
                effect: preset.effect,
                speed: preset.speed,
                color_fg: this.hexToRgb(preset.fgColor),
                color_bg: this.hexToRgb(preset.bgColor),
                font: preset.font,
                rainbow_mode: preset.rainbowMode
              });
            }
            this.shadowRoot.querySelectorAll(".preset-item").forEach((p) => p.classList.remove("active"));
            item.classList.add("active");
          }
        });
      });
      this.shadowRoot.querySelectorAll('[data-action="edit"]').forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          e2.stopPropagation();
          const index = parseInt(e2.currentTarget.dataset.index);
          const preset = this._presets[index];
          if (preset) {
            this._editingPreset = index;
            this._selectedIcon = preset.icon || "\u{1F4FA}";
            this.shadowRoot.getElementById("preset-form").style.display = "block";
            this.shadowRoot.getElementById("preset-name").value = preset.name;
            this.shadowRoot.querySelectorAll(".icon-option").forEach((o2) => {
              o2.classList.toggle("selected", o2.dataset.icon === preset.icon);
            });
          }
        });
      });
      this.shadowRoot.querySelectorAll('[data-action="delete"]').forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          e2.stopPropagation();
          const index = parseInt(e2.currentTarget.dataset.index);
          if (confirm("Delete this preset?")) {
            this._presets.splice(index, 1);
            this._savePresets();
            this.render();
          }
        });
      });
    }
    static getConfigElement() {
      return document.createElement("ipixel-simple-editor");
    }
    static getStubConfig() {
      return { entity: "" };
    }
  };

  // src/cards/schedule-card.js
  var SCHEDULES_STORAGE_KEY = "iPIXEL_Schedules";
  var iPIXELScheduleCard = class extends iPIXELCardBase {
    constructor() {
      super();
      this._schedules = this._loadSchedules();
      this._powerSchedule = this._loadPowerSchedule();
      this._editingSlot = null;
      this._checkInterval = null;
    }
    connectedCallback() {
      this._checkInterval = setInterval(() => this._checkSchedules(), 6e4);
      this._checkSchedules();
    }
    disconnectedCallback() {
      if (this._checkInterval) {
        clearInterval(this._checkInterval);
      }
    }
    _loadSchedules() {
      try {
        const saved = localStorage.getItem(SCHEDULES_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (e2) {
        return [];
      }
    }
    _saveSchedules() {
      try {
        localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(this._schedules));
      } catch (e2) {
        console.warn("iPIXEL: Failed to save schedules", e2);
      }
    }
    _loadPowerSchedule() {
      try {
        const saved = localStorage.getItem("iPIXEL_PowerSchedule");
        return saved ? JSON.parse(saved) : { enabled: false, onTime: "07:00", offTime: "22:00" };
      } catch (e2) {
        return { enabled: false, onTime: "07:00", offTime: "22:00" };
      }
    }
    _savePowerSchedule() {
      try {
        localStorage.setItem("iPIXEL_PowerSchedule", JSON.stringify(this._powerSchedule));
      } catch (e2) {
        console.warn("iPIXEL: Failed to save power schedule", e2);
      }
    }
    _checkSchedules() {
      const now = /* @__PURE__ */ new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const currentDay = now.getDay();
      for (const schedule of this._schedules) {
        if (!schedule.enabled)
          continue;
        if (schedule.days && !schedule.days.includes(currentDay))
          continue;
        if (schedule.startTime === currentTime) {
          updateDisplayState({
            text: schedule.text || "",
            mode: schedule.mode || "text",
            effect: schedule.effect || "fixed",
            fgColor: schedule.fgColor || "#ff6600",
            bgColor: schedule.bgColor || "#000000"
          });
          if (schedule.mode === "text" && schedule.text) {
            this.callService("ipixel_color", "display_text", {
              text: schedule.text,
              effect: schedule.effect,
              color_fg: this.hexToRgb(schedule.fgColor),
              color_bg: this.hexToRgb(schedule.bgColor)
            });
          } else if (schedule.mode === "clock") {
            this.callService("ipixel_color", "set_clock_mode", { style: 1 });
          }
        }
      }
    }
    render() {
      if (!this._hass)
        return;
      const now = /* @__PURE__ */ new Date();
      const nowPos = (now.getHours() * 60 + now.getMinutes()) / 1440 * 100;
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const scheduleBlocks = this._schedules.filter((s2) => s2.enabled).map((s2) => {
        const startMins = this._timeToMinutes(s2.startTime);
        const endMins = s2.endTime ? this._timeToMinutes(s2.endTime) : startMins + 60;
        const startPos = startMins / 1440 * 100;
        const width = (endMins - startMins) / 1440 * 100;
        return `<div class="timeline-block" style="left: ${startPos}%; width: ${width}%; background: ${s2.fgColor || "#03a9f4"}40;" title="${s2.name || "Schedule"}"></div>`;
      }).join("");
      const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
      this.shadowRoot.innerHTML = `
      <style>${iPIXELCardStyles}
        .timeline { background: rgba(255,255,255,0.05); border-radius: 6px; padding: 12px; margin-bottom: 12px; }
        .timeline-header { display: flex; justify-content: space-between; font-size: 0.7em; opacity: 0.5; margin-bottom: 6px; }
        .timeline-bar { height: 32px; background: rgba(255,255,255,0.1); border-radius: 4px; position: relative; overflow: hidden; }
        .timeline-now { position: absolute; width: 2px; height: 100%; background: #f44336; left: ${nowPos}%; z-index: 2; }
        .timeline-block { position: absolute; height: 100%; border-radius: 2px; z-index: 1; }
        .power-section { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
        .power-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .power-row label { font-size: 0.85em; }
        .power-row input[type="time"] {
          padding: 6px 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          color: inherit;
        }
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
          max-height: 250px;
          overflow-y: auto;
        }
        .schedule-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .schedule-toggle {
          width: 36px;
          height: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
        }
        .schedule-toggle.active {
          background: var(--primary-color, #03a9f4);
        }
        .schedule-toggle::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .schedule-toggle.active::after {
          transform: translateX(16px);
        }
        .schedule-info { flex: 1; min-width: 0; }
        .schedule-name { font-weight: 500; font-size: 0.9em; }
        .schedule-time { font-size: 0.75em; opacity: 0.6; }
        .schedule-actions button {
          padding: 4px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          border-radius: 4px;
        }
        .schedule-actions button:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .add-slot-form {
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 16px;
          margin-top: 12px;
        }
        .form-row { margin-bottom: 12px; }
        .form-row label { display: block; font-size: 0.8em; opacity: 0.7; margin-bottom: 4px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .day-selector {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .day-btn {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          background: transparent;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 0.75em;
          transition: all 0.2s;
        }
        .day-btn.selected {
          background: var(--primary-color, #03a9f4);
          border-color: var(--primary-color, #03a9f4);
          color: #fff;
        }
        .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
        .current-time { font-size: 0.85em; opacity: 0.7; text-align: right; margin-bottom: 4px; }
      </style>
      <ha-card>
        <div class="card-content">
          <div class="current-time">Current: ${currentTime}</div>

          <div class="section-title">Timeline</div>
          <div class="timeline">
            <div class="timeline-header">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
            </div>
            <div class="timeline-bar">
              ${scheduleBlocks}
              <div class="timeline-now"></div>
            </div>
          </div>

          <div class="section-title">Power Schedule</div>
          <div class="power-section">
            <div class="power-row">
              <div class="schedule-toggle ${this._powerSchedule.enabled ? "active" : ""}" id="power-toggle"></div>
              <label>On:</label>
              <input type="time" id="power-on" value="${this._powerSchedule.onTime}">
              <label>Off:</label>
              <input type="time" id="power-off" value="${this._powerSchedule.offTime}">
              <button class="btn btn-primary" id="save-power">Save</button>
            </div>
          </div>

          <div class="section-title">Content Schedules</div>
          <div class="schedule-list" id="schedule-list">
            ${this._schedules.length === 0 ? `
              <div class="empty-state" style="padding: 20px; text-align: center; opacity: 0.5;">
                No schedules configured
              </div>
            ` : this._schedules.map((slot, i2) => `
              <div class="schedule-item" data-index="${i2}">
                <div class="schedule-toggle ${slot.enabled ? "active" : ""}" data-action="toggle" data-index="${i2}"></div>
                <div class="schedule-info">
                  <div class="schedule-name">${this._escapeHtml(slot.name || "Schedule " + (i2 + 1))}</div>
                  <div class="schedule-time">
                    ${slot.startTime}${slot.endTime ? " - " + slot.endTime : ""} \xB7
                    ${slot.days ? slot.days.map((d) => dayNames[d]).join(", ") : "Daily"} \xB7
                    ${slot.mode || "text"}
                  </div>
                </div>
                <div class="schedule-actions">
                  <button data-action="edit" data-index="${i2}" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>
                  </button>
                  <button data-action="delete" data-index="${i2}" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
                  </button>
                </div>
              </div>
            `).join("")}
          </div>

          <button class="btn btn-secondary" id="add-slot" style="width: 100%;">+ Add Schedule</button>

          <div class="add-slot-form" id="slot-form" style="display: none;">
            <div class="form-row">
              <label>Name</label>
              <input type="text" class="text-input" id="slot-name" placeholder="Morning Message">
            </div>
            <div class="form-grid">
              <div class="form-row">
                <label>Start Time</label>
                <input type="time" class="text-input" id="slot-start" value="08:00" style="width: 100%;">
              </div>
              <div class="form-row">
                <label>End Time (optional)</label>
                <input type="time" class="text-input" id="slot-end" style="width: 100%;">
              </div>
            </div>
            <div class="form-row">
              <label>Days</label>
              <div class="day-selector" id="day-selector">
                ${dayNames.map((name, i2) => `
                  <button type="button" class="day-btn selected" data-day="${i2}">${name}</button>
                `).join("")}
              </div>
            </div>
            <div class="form-grid">
              <div class="form-row">
                <label>Mode</label>
                <select class="dropdown" id="slot-mode">
                  <option value="text">Text</option>
                  <option value="clock">Clock</option>
                  <option value="off">Power Off</option>
                </select>
              </div>
              <div class="form-row">
                <label>Effect</label>
                <select class="dropdown" id="slot-effect">
                  <option value="fixed">Fixed</option>
                  <option value="scroll_ltr">Scroll Left</option>
                  <option value="scroll_rtl">Scroll Right</option>
                  <option value="blink">Blink</option>
                </select>
              </div>
            </div>
            <div class="form-row" id="text-row">
              <label>Text</label>
              <input type="text" class="text-input" id="slot-text" placeholder="Good Morning!">
            </div>
            <div class="form-grid">
              <div class="form-row">
                <label>Text Color</label>
                <input type="color" id="slot-fg-color" value="#ff6600" style="width: 100%; height: 32px;">
              </div>
              <div class="form-row">
                <label>Background</label>
                <input type="color" id="slot-bg-color" value="#000000" style="width: 100%; height: 32px;">
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary" id="cancel-slot">Cancel</button>
              <button class="btn btn-primary" id="save-slot">Save Schedule</button>
            </div>
          </div>
        </div>
      </ha-card>`;
      this._attachListeners();
    }
    _timeToMinutes(time) {
      const [h2, m] = time.split(":").map(Number);
      return h2 * 60 + m;
    }
    _escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
    _attachListeners() {
      this.shadowRoot.getElementById("power-toggle")?.addEventListener("click", (e2) => {
        this._powerSchedule.enabled = !this._powerSchedule.enabled;
        e2.currentTarget.classList.toggle("active", this._powerSchedule.enabled);
      });
      this.shadowRoot.getElementById("save-power")?.addEventListener("click", () => {
        this._powerSchedule.onTime = this.shadowRoot.getElementById("power-on")?.value || "07:00";
        this._powerSchedule.offTime = this.shadowRoot.getElementById("power-off")?.value || "22:00";
        this._savePowerSchedule();
        this.callService("ipixel_color", "set_power_schedule", {
          enabled: this._powerSchedule.enabled,
          on_time: this._powerSchedule.onTime,
          off_time: this._powerSchedule.offTime
        });
      });
      this.shadowRoot.getElementById("add-slot")?.addEventListener("click", () => {
        this._editingSlot = null;
        this._resetSlotForm();
        this.shadowRoot.getElementById("slot-form").style.display = "block";
      });
      this.shadowRoot.getElementById("cancel-slot")?.addEventListener("click", () => {
        this.shadowRoot.getElementById("slot-form").style.display = "none";
        this._editingSlot = null;
      });
      this.shadowRoot.querySelectorAll(".day-btn").forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          e2.currentTarget.classList.toggle("selected");
        });
      });
      this.shadowRoot.getElementById("slot-mode")?.addEventListener("change", (e2) => {
        const textRow = this.shadowRoot.getElementById("text-row");
        if (textRow) {
          textRow.style.display = e2.target.value === "text" ? "block" : "none";
        }
      });
      this.shadowRoot.getElementById("save-slot")?.addEventListener("click", () => {
        const selectedDays = Array.from(this.shadowRoot.querySelectorAll(".day-btn.selected")).map((btn) => parseInt(btn.dataset.day));
        const slot = {
          name: this.shadowRoot.getElementById("slot-name")?.value || "Schedule",
          startTime: this.shadowRoot.getElementById("slot-start")?.value || "08:00",
          endTime: this.shadowRoot.getElementById("slot-end")?.value || "",
          days: selectedDays.length === 7 ? null : selectedDays,
          mode: this.shadowRoot.getElementById("slot-mode")?.value || "text",
          effect: this.shadowRoot.getElementById("slot-effect")?.value || "fixed",
          text: this.shadowRoot.getElementById("slot-text")?.value || "",
          fgColor: this.shadowRoot.getElementById("slot-fg-color")?.value || "#ff6600",
          bgColor: this.shadowRoot.getElementById("slot-bg-color")?.value || "#000000",
          enabled: true
        };
        if (this._editingSlot !== null) {
          this._schedules[this._editingSlot] = slot;
        } else {
          this._schedules.push(slot);
        }
        this._saveSchedules();
        this.shadowRoot.getElementById("slot-form").style.display = "none";
        this._editingSlot = null;
        this.render();
      });
      this.shadowRoot.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          const index = parseInt(e2.currentTarget.dataset.index);
          this._schedules[index].enabled = !this._schedules[index].enabled;
          this._saveSchedules();
          e2.currentTarget.classList.toggle("active", this._schedules[index].enabled);
        });
      });
      this.shadowRoot.querySelectorAll('[data-action="edit"]').forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          const index = parseInt(e2.currentTarget.dataset.index);
          const slot = this._schedules[index];
          if (slot) {
            this._editingSlot = index;
            this._fillSlotForm(slot);
            this.shadowRoot.getElementById("slot-form").style.display = "block";
          }
        });
      });
      this.shadowRoot.querySelectorAll('[data-action="delete"]').forEach((btn) => {
        btn.addEventListener("click", (e2) => {
          const index = parseInt(e2.currentTarget.dataset.index);
          if (confirm("Delete this schedule?")) {
            this._schedules.splice(index, 1);
            this._saveSchedules();
            this.render();
          }
        });
      });
    }
    _resetSlotForm() {
      this.shadowRoot.getElementById("slot-name").value = "";
      this.shadowRoot.getElementById("slot-start").value = "08:00";
      this.shadowRoot.getElementById("slot-end").value = "";
      this.shadowRoot.getElementById("slot-mode").value = "text";
      this.shadowRoot.getElementById("slot-effect").value = "fixed";
      this.shadowRoot.getElementById("slot-text").value = "";
      this.shadowRoot.getElementById("slot-fg-color").value = "#ff6600";
      this.shadowRoot.getElementById("slot-bg-color").value = "#000000";
      this.shadowRoot.querySelectorAll(".day-btn").forEach((btn) => btn.classList.add("selected"));
      this.shadowRoot.getElementById("text-row").style.display = "block";
    }
    _fillSlotForm(slot) {
      this.shadowRoot.getElementById("slot-name").value = slot.name || "";
      this.shadowRoot.getElementById("slot-start").value = slot.startTime || "08:00";
      this.shadowRoot.getElementById("slot-end").value = slot.endTime || "";
      this.shadowRoot.getElementById("slot-mode").value = slot.mode || "text";
      this.shadowRoot.getElementById("slot-effect").value = slot.effect || "fixed";
      this.shadowRoot.getElementById("slot-text").value = slot.text || "";
      this.shadowRoot.getElementById("slot-fg-color").value = slot.fgColor || "#ff6600";
      this.shadowRoot.getElementById("slot-bg-color").value = slot.bgColor || "#000000";
      const selectedDays = slot.days || [0, 1, 2, 3, 4, 5, 6];
      this.shadowRoot.querySelectorAll(".day-btn").forEach((btn) => {
        btn.classList.toggle("selected", selectedDays.includes(parseInt(btn.dataset.day)));
      });
      this.shadowRoot.getElementById("text-row").style.display = slot.mode === "text" ? "block" : "none";
    }
    static getConfigElement() {
      return document.createElement("ipixel-simple-editor");
    }
    static getStubConfig() {
      return { entity: "" };
    }
  };

  // src/cards/editor-card.js
  var PALETTE_COLORS = [
    "#FFFFFF",
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0080FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FF8000",
    "#8000FF",
    "#2EC4FF",
    "#0010A0",
    "#A0FF00",
    "#FF80C0",
    "#808080",
    "#C0C0C0"
  ];
  var RESOLUTION_OPTIONS = [
    { value: "16x16", label: "16\xD716" },
    { value: "32x8", label: "32\xD78" },
    { value: "32x16", label: "32\xD716" },
    { value: "32x32", label: "32\xD732" },
    { value: "64x16", label: "64\xD716" },
    { value: "96x16", label: "96\xD716" },
    { value: "128x16", label: "128\xD716" }
  ];
  var BG_COLOR = { r: 25, g: 25, b: 25 };
  var iPIXELEditorCard = class extends iPIXELCardBase {
    constructor() {
      super();
      this._width = 64;
      this._height = 16;
      this._tool = "pen";
      this._drawing = false;
      this._gridOn = true;
      this._currentColor = "#ff6600";
      this._scale = 8;
      this._sending = false;
      this._logicalCanvas = document.createElement("canvas");
      this._ctx = this._logicalCanvas.getContext("2d");
      this._displayCanvas = null;
      this._dctx = null;
      this._initialized = false;
    }
    setConfig(config) {
      if (!config.entity)
        throw new Error("Please define an entity");
      this._config = config;
    }
    set hass(hass) {
      const hadHass = !!this._hass;
      this._hass = hass;
      if (!hadHass) {
        const [w, h2] = this.getResolution();
        this._width = w;
        this._height = h2;
        this._logicalCanvas.width = w;
        this._logicalCanvas.height = h2;
        this.render();
      }
    }
    render() {
      if (!this._hass)
        return;
      const entity = this.getEntity();
      const isOn = this.isOn();
      const [deviceWidth, deviceHeight] = this.getResolution();
      const resolutionOptions = RESOLUTION_OPTIONS.map((opt) => {
        const selected = opt.value === `${this._width}x${this._height}` ? "selected" : "";
        return `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
      }).join("");
      const paletteSwatches = PALETTE_COLORS.map((color) => {
        const active = color.toLowerCase() === this._currentColor.toLowerCase() ? "active" : "";
        return `<div class="color-swatch ${active}" data-color="${color}" style="background:${color}"></div>`;
      }).join("");
      this.shadowRoot.innerHTML = `
      <style>
        ${iPIXELCardStyles}

        .editor-toolbar {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .tool-group {
          display: flex;
          gap: 4px;
        }

        .color-palette {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 12px;
        }

        .color-swatch {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid transparent;
          box-sizing: border-box;
        }

        .color-swatch:hover {
          border-color: rgba(255,255,255,0.5);
        }

        .color-swatch.active {
          border-color: var(--ipixel-primary);
          box-shadow: 0 0 0 1px var(--ipixel-primary);
        }

        .canvas-container {
          background: #050608;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 12px;
          overflow: auto;
          text-align: center;
        }

        #editor-canvas {
          display: inline-block;
          cursor: crosshair;
          image-rendering: pixelated;
          touch-action: none;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75em;
          opacity: 0.6;
          margin-bottom: 8px;
        }

        .tool-icon {
          font-size: 16px;
        }

        .resolution-select {
          padding: 6px 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid var(--ipixel-border);
          border-radius: 6px;
          color: inherit;
          font-size: 0.85em;
          cursor: pointer;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>

      <ha-card>
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">
              <span class="status-dot ${isOn ? "" : "off"}"></span>
              ${this._config.name || "Pixel Editor"}
            </div>
          </div>

          <!-- Toolbar -->
          <div class="editor-toolbar">
            <div class="tool-group">
              <button class="icon-btn ${this._tool === "pen" ? "active" : ""}" id="pen-tool" title="Pen Tool">
                <span class="tool-icon">&#9998;</span>
              </button>
              <button class="icon-btn ${this._tool === "eraser" ? "active" : ""}" id="eraser-tool" title="Eraser Tool">
                <span class="tool-icon">&#9746;</span>
              </button>
            </div>
            <input type="color" class="color-picker" id="color-picker" value="${this._currentColor}" title="Pick Color">
            <button class="icon-btn ${this._gridOn ? "active" : ""}" id="grid-toggle" title="Toggle LED Grid">
              <span class="tool-icon">&#9638;</span>
            </button>
            <select class="resolution-select" id="resolution-select" title="Canvas Size">
              ${resolutionOptions}
            </select>
          </div>

          <!-- Color Palette -->
          <div class="color-palette" id="palette">
            ${paletteSwatches}
          </div>

          <!-- Canvas -->
          <div class="canvas-container">
            <canvas id="editor-canvas"></canvas>
          </div>

          <!-- Info -->
          <div class="info-row">
            <span>Tool: ${this._tool} | Grid: ${this._gridOn ? "LED" : "Flat"}</span>
            <span>Device: ${deviceWidth}\xD7${deviceHeight}</span>
          </div>

          <!-- Actions -->
          <div class="button-grid button-grid-3">
            <button class="btn btn-secondary" id="clear-btn">Clear</button>
            <button class="btn btn-secondary" id="import-btn">Import</button>
            <button class="btn btn-primary send-btn" id="send-btn" ${this._sending ? "disabled" : ""}>
              ${this._sending ? "Sending..." : "Send to Device"}
            </button>
          </div>

          <!-- Hidden file input for import -->
          <input type="file" id="file-input" accept="image/png,image/gif,image/jpeg" style="display:none">
        </div>
      </ha-card>
    `;
      this._initCanvas();
      this._attachListeners();
    }
    _initCanvas() {
      this._displayCanvas = this.shadowRoot.getElementById("editor-canvas");
      if (!this._displayCanvas)
        return;
      this._dctx = this._displayCanvas.getContext("2d");
      if (this._logicalCanvas.width !== this._width || this._logicalCanvas.height !== this._height) {
        this._logicalCanvas.width = this._width;
        this._logicalCanvas.height = this._height;
      }
      this._updateDisplaySize();
      this._renderDisplay();
      this._initialized = true;
    }
    _updateDisplaySize() {
      if (!this._displayCanvas)
        return;
      this._displayCanvas.width = this._width * this._scale;
      this._displayCanvas.height = this._height * this._scale;
    }
    _renderDisplay() {
      if (!this._dctx || !this._ctx)
        return;
      this._updateDisplaySize();
      this._dctx.fillStyle = "#050608";
      this._dctx.fillRect(0, 0, this._displayCanvas.width, this._displayCanvas.height);
      const imgData = this._ctx.getImageData(0, 0, this._width, this._height).data;
      const cellSize = this._scale;
      const ledRadius = cellSize * 0.38;
      for (let y = 0; y < this._height; y++) {
        for (let x = 0; x < this._width; x++) {
          const idx = (y * this._width + x) * 4;
          const r2 = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a2 = imgData[idx + 3];
          const isOffPixel = a2 === 0;
          const sx = x * cellSize;
          const sy = y * cellSize;
          const cx = sx + cellSize / 2;
          const cy = sy + cellSize / 2;
          this._dctx.fillStyle = `rgb(${BG_COLOR.r},${BG_COLOR.g},${BG_COLOR.b})`;
          this._dctx.fillRect(sx, sy, cellSize, cellSize);
          if (this._gridOn) {
            if (!isOffPixel) {
              const grad = this._dctx.createRadialGradient(
                cx,
                cy,
                ledRadius * 0.3,
                cx,
                cy,
                ledRadius * 1.8
              );
              grad.addColorStop(0, `rgba(${r2},${g},${b},0.4)`);
              grad.addColorStop(1, `rgba(${r2},${g},${b},0)`);
              this._dctx.fillStyle = grad;
              this._dctx.beginPath();
              this._dctx.arc(cx, cy, ledRadius * 1.8, 0, Math.PI * 2);
              this._dctx.fill();
              this._dctx.fillStyle = `rgb(${r2},${g},${b})`;
              this._dctx.beginPath();
              this._dctx.arc(cx, cy, ledRadius, 0, Math.PI * 2);
              this._dctx.fill();
            } else {
              this._dctx.fillStyle = "rgb(5,5,5)";
              this._dctx.beginPath();
              this._dctx.arc(cx, cy, ledRadius, 0, Math.PI * 2);
              this._dctx.fill();
            }
          } else {
            if (!isOffPixel) {
              this._dctx.fillStyle = `rgb(${r2},${g},${b})`;
            } else {
              this._dctx.fillStyle = `rgb(${BG_COLOR.r},${BG_COLOR.g},${BG_COLOR.b})`;
            }
            this._dctx.fillRect(sx, sy, cellSize, cellSize);
          }
        }
      }
    }
    _getPixelPos(evt) {
      if (!this._displayCanvas)
        return null;
      const rect = this._displayCanvas.getBoundingClientRect();
      const cellW = rect.width / this._width;
      const cellH = rect.height / this._height;
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      const x = Math.floor((clientX - rect.left) / cellW);
      const y = Math.floor((clientY - rect.top) / cellH);
      if (x < 0 || y < 0 || x >= this._width || y >= this._height)
        return null;
      return { x, y };
    }
    _drawAt(evt) {
      const p = this._getPixelPos(evt);
      if (!p)
        return;
      if (this._tool === "pen") {
        this._ctx.fillStyle = this._currentColor;
        this._ctx.fillRect(p.x, p.y, 1, 1);
      } else {
        this._ctx.clearRect(p.x, p.y, 1, 1);
      }
      this._renderDisplay();
    }
    _attachListeners() {
      const canvas = this.shadowRoot.getElementById("editor-canvas");
      if (!canvas)
        return;
      canvas.addEventListener("mousedown", (e2) => {
        e2.preventDefault();
        this._drawing = true;
        this._drawAt(e2);
      });
      canvas.addEventListener("mousemove", (e2) => {
        if (this._drawing)
          this._drawAt(e2);
      });
      window.addEventListener("mouseup", () => {
        this._drawing = false;
      });
      canvas.addEventListener("touchstart", (e2) => {
        e2.preventDefault();
        this._drawing = true;
        this._drawAt(e2);
      }, { passive: false });
      canvas.addEventListener("touchmove", (e2) => {
        e2.preventDefault();
        if (this._drawing)
          this._drawAt(e2);
      }, { passive: false });
      canvas.addEventListener("touchend", () => {
        this._drawing = false;
      });
      this.shadowRoot.getElementById("pen-tool")?.addEventListener("click", () => {
        this._tool = "pen";
        this.render();
      });
      this.shadowRoot.getElementById("eraser-tool")?.addEventListener("click", () => {
        this._tool = "eraser";
        this.render();
      });
      this.shadowRoot.getElementById("color-picker")?.addEventListener("input", (e2) => {
        this._currentColor = e2.target.value;
        this._updatePaletteSelection();
      });
      this.shadowRoot.querySelectorAll(".color-swatch").forEach((swatch) => {
        swatch.addEventListener("click", () => {
          this._currentColor = swatch.dataset.color;
          this.shadowRoot.getElementById("color-picker").value = this._currentColor;
          this._updatePaletteSelection();
        });
      });
      this.shadowRoot.getElementById("grid-toggle")?.addEventListener("click", () => {
        this._gridOn = !this._gridOn;
        this.render();
      });
      this.shadowRoot.getElementById("resolution-select")?.addEventListener("change", (e2) => {
        const [w, h2] = e2.target.value.split("x").map((v) => parseInt(v, 10));
        this._resizeCanvas(w, h2);
      });
      this.shadowRoot.getElementById("clear-btn")?.addEventListener("click", () => {
        this._clearCanvas();
      });
      this.shadowRoot.getElementById("import-btn")?.addEventListener("click", () => {
        this.shadowRoot.getElementById("file-input")?.click();
      });
      this.shadowRoot.getElementById("file-input")?.addEventListener("change", (e2) => {
        const file = e2.target.files?.[0];
        if (file)
          this._handleImport(file);
      });
      this.shadowRoot.getElementById("send-btn")?.addEventListener("click", () => {
        this._sendToDevice();
      });
    }
    _updatePaletteSelection() {
      this.shadowRoot.querySelectorAll(".color-swatch").forEach((swatch) => {
        if (swatch.dataset.color.toLowerCase() === this._currentColor.toLowerCase()) {
          swatch.classList.add("active");
        } else {
          swatch.classList.remove("active");
        }
      });
    }
    _resizeCanvas(w, h2) {
      const oldData = this._ctx.getImageData(0, 0, this._width, this._height);
      this._width = w;
      this._height = h2;
      this._logicalCanvas.width = w;
      this._logicalCanvas.height = h2;
      this._ctx.putImageData(oldData, 0, 0);
      this._updateDisplaySize();
      this._renderDisplay();
      const infoRow = this.shadowRoot.querySelector(".info-row span:first-child");
      if (infoRow) {
        infoRow.textContent = `Tool: ${this._tool} | Grid: ${this._gridOn ? "LED" : "Flat"}`;
      }
    }
    _clearCanvas() {
      this._ctx.clearRect(0, 0, this._width, this._height);
      this._renderDisplay();
    }
    _handleImport(file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          this._ctx.clearRect(0, 0, this._width, this._height);
          this._ctx.imageSmoothingEnabled = false;
          this._ctx.drawImage(img, 0, 0, this._width, this._height);
          this._renderDisplay();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
    async _sendToDevice() {
      if (this._sending)
        return;
      this._sending = true;
      this.render();
      try {
        const imgData = this._ctx.getImageData(0, 0, this._width, this._height).data;
        const pixels = [];
        for (let y = 0; y < this._height; y++) {
          for (let x = 0; x < this._width; x++) {
            const idx = (y * this._width + x) * 4;
            const r2 = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a2 = imgData[idx + 3];
            if (a2 > 0) {
              pixels.push({
                x,
                y,
                color: this._rgbToHex(r2, g, b)
              });
            }
          }
        }
        if (pixels.length > 0) {
          await this.callService("ipixel_color", "set_pixels", {
            pixels
          });
        }
      } catch (err) {
        console.error("Failed to send pixels to device:", err);
      } finally {
        this._sending = false;
        this.render();
      }
    }
    _rgbToHex(r2, g, b) {
      return (r2 << 16 | g << 8 | b).toString(16).padStart(6, "0");
    }
    static getConfigElement() {
      return document.createElement("ipixel-simple-editor");
    }
    static getStubConfig() {
      return { entity: "" };
    }
    getCardSize() {
      return 4;
    }
  };

  // src/editor.js
  var iPIXELSimpleEditor = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    setConfig(config) {
      this._config = config;
      this.render();
    }
    set hass(hass) {
      this._hass = hass;
      this.render();
    }
    render() {
      if (!this._hass)
        return;
      const entities = Object.keys(this._hass.states).filter((e2) => e2.startsWith("text.") || e2.startsWith("switch.")).sort();
      this.shadowRoot.innerHTML = `
      <style>
        .row { margin-bottom: 12px; }
        label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 0.9em; }
        select, input {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color);
          color: inherit;
          box-sizing: border-box;
        }
      </style>
      <div class="row">
        <label>Entity</label>
        <select id="entity">
          <option value="">Select entity</option>
          ${entities.map((e2) => `
            <option value="${e2}" ${this._config?.entity === e2 ? "selected" : ""}>
              ${this._hass.states[e2]?.attributes?.friendly_name || e2}
            </option>
          `).join("")}
        </select>
      </div>
      <div class="row">
        <label>Name (optional)</label>
        <input type="text" id="name" value="${this._config?.name || ""}" placeholder="Display name">
      </div>`;
      this.shadowRoot.querySelectorAll("select, input").forEach((el) => {
        el.addEventListener("change", () => this.fireConfig());
      });
    }
    fireConfig() {
      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: {
          config: {
            type: this._config?.type || "custom:ipixel-display-card",
            entity: this.shadowRoot.getElementById("entity")?.value,
            name: this.shadowRoot.getElementById("name")?.value || void 0
          }
        },
        bubbles: true,
        composed: true
      }));
    }
  };

  // src/index.js
  customElements.define("ipixel-display-card", iPIXELDisplayCard);
  customElements.define("ipixel-controls-card", iPIXELControlsCard);
  customElements.define("ipixel-text-card", iPIXELTextCard);
  customElements.define("ipixel-playlist-card", iPIXELPlaylistCard);
  customElements.define("ipixel-schedule-card", iPIXELScheduleCard);
  customElements.define("ipixel-editor-card", iPIXELEditorCard);
  customElements.define("ipixel-simple-editor", iPIXELSimpleEditor);
  window.customCards = window.customCards || [];
  [
    { type: "ipixel-display-card", name: "iPIXEL Display", description: "LED matrix preview with power control" },
    { type: "ipixel-controls-card", name: "iPIXEL Controls", description: "Brightness, mode, and orientation controls" },
    { type: "ipixel-text-card", name: "iPIXEL Text", description: "Text input with effects and colors" },
    { type: "ipixel-playlist-card", name: "iPIXEL Playlist", description: "Playlist management" },
    { type: "ipixel-schedule-card", name: "iPIXEL Schedule", description: "Power schedule and time slots" },
    { type: "ipixel-editor-card", name: "iPIXEL Pixel Editor", description: "Draw custom pixel art and send to your LED matrix" }
  ].forEach((card) => window.customCards.push({
    ...card,
    preview: true,
    documentationURL: "https://github.com/cagcoach/ha-ipixel-color"
  }));
  console.info(
    `%c iPIXEL Cards %c ${CARD_VERSION} `,
    "background:#03a9f4;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;",
    "background:#333;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;"
  );
})();
//# sourceMappingURL=ipixel-display-card.js.map
