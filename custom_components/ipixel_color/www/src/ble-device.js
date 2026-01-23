/**
 * WebBluetooth Device Bridge for iPIXEL
 * Allows direct connection to iPIXEL devices from the browser for testing
 * Based on iPixel-Control by nicehunter
 */

// BLE UUIDs for iPIXEL devices
const SERVICE_UUID = '000000fa-0000-1000-8000-00805f9b34fb';
const CHAR_UUID = '0000fa02-0000-1000-8000-00805f9b34fb';

// Connection state
let device = null;
let server = null;
let characteristic = null;
let isConnected = false;

// Event callbacks
const listeners = {
  connect: [],
  disconnect: [],
  error: []
};

/**
 * Check if WebBluetooth is available
 */
export function isWebBluetoothAvailable() {
  return navigator.bluetooth !== undefined;
}

/**
 * Check if currently connected
 */
export function isDeviceConnected() {
  return isConnected && device?.gatt?.connected;
}

/**
 * Get connected device name
 */
export function getDeviceName() {
  return device?.name || null;
}

/**
 * Add event listener
 */
export function addEventListener(event, callback) {
  if (listeners[event]) {
    listeners[event].push(callback);
  }
}

/**
 * Remove event listener
 */
export function removeEventListener(event, callback) {
  if (listeners[event]) {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  }
}

/**
 * Emit event to listeners
 */
function emit(event, data) {
  if (listeners[event]) {
    listeners[event].forEach(cb => cb(data));
  }
}

/**
 * Connect to an iPIXEL device
 */
export async function connectDevice() {
  if (!isWebBluetoothAvailable()) {
    throw new Error('WebBluetooth is not available. Use Chrome or Edge.');
  }

  try {
    // Request device with LED_BLE_ prefix
    device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'LED_BLE_' }],
      optionalServices: [SERVICE_UUID]
    });

    console.log(`iPIXEL BLE: Found device: ${device.name}`);

    // Connect to GATT server
    server = await device.gatt.connect();
    console.log('iPIXEL BLE: Connected to GATT server');

    // Get service and characteristic
    const service = await server.getPrimaryService(SERVICE_UUID);
    characteristic = await service.getCharacteristic(CHAR_UUID);
    console.log('iPIXEL BLE: Got characteristic');

    isConnected = true;

    // Handle disconnection
    device.addEventListener('gattserverdisconnected', () => {
      console.log('iPIXEL BLE: Device disconnected');
      isConnected = false;
      emit('disconnect', { device: device.name });
    });

    emit('connect', { device: device.name });
    return device.name;
  } catch (error) {
    console.error('iPIXEL BLE: Connection failed:', error);
    emit('error', { error });
    throw error;
  }
}

/**
 * Disconnect from device
 */
export async function disconnectDevice() {
  if (device?.gatt?.connected) {
    await device.gatt.disconnect();
  }
  isConnected = false;
  device = null;
  server = null;
  characteristic = null;
}

/**
 * Send raw command to device
 */
export async function sendCommand(data) {
  if (!isDeviceConnected() || !characteristic) {
    throw new Error('Not connected to device');
  }

  const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
  await characteristic.writeValue(uint8Data);
  console.log('iPIXEL BLE: Sent command:', Array.from(uint8Data).map(b => b.toString(16).padStart(2, '0')).join(' '));
}

/**
 * Power on the device
 */
export async function powerOn() {
  await sendCommand([0x05, 0x00, 0x07, 0x01, 0x01]);
}

/**
 * Power off the device
 */
export async function powerOff() {
  await sendCommand([0x05, 0x00, 0x07, 0x01, 0x00]);
}

/**
 * Set brightness (1-100)
 */
export async function setBrightness(value) {
  const brightness = Math.max(1, Math.min(100, value));
  await sendCommand([0x05, 0x00, 0x04, 0x80, brightness]);
}

/**
 * Sync time to device
 */
export async function syncTime() {
  const now = new Date();
  await sendCommand([
    0x08, 0x00, 0x01, 0x80,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    0x00
  ]);
}

/**
 * Enter DIY mode (for direct pixel control)
 */
export async function enterDiyMode() {
  await sendCommand([0x05, 0x00, 0x04, 0x01, 0x01]);
}

/**
 * Exit DIY mode
 */
export async function exitDiyMode() {
  await sendCommand([0x05, 0x00, 0x04, 0x01, 0x00]);
}

/**
 * Set a single pixel color
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 */
export async function setPixel(x, y, r, g, b) {
  await sendCommand([
    0x0A, 0x00, 0x05, 0x01,
    r, g, b, 0xFF,  // RGBA
    x, y            // Position
  ]);
}

/**
 * Convert hex color to RGB
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
 * Send pixel array to device (DIY mode)
 * @param {string[]} pixels - Array of hex color strings
 * @param {number} width - Display width
 * @param {number} height - Display height
 */
export async function sendPixels(pixels, width, height) {
  if (!isDeviceConnected()) {
    throw new Error('Not connected to device');
  }

  // Enter DIY mode first
  await enterDiyMode();
  await new Promise(r => setTimeout(r, 100));

  // Send each pixel that's not black
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const color = pixels[idx] || '#000000';
      const rgb = hexToRgb(color);

      // Skip dark pixels (background)
      if (rgb.r > 10 || rgb.g > 10 || rgb.b > 10) {
        await setPixel(x, y, rgb.r, rgb.g, rgb.b);
        // Small delay to prevent BLE buffer overflow
        await new Promise(r => setTimeout(r, 5));
      }
    }
  }

  console.log('iPIXEL BLE: Finished sending pixels');
}

// Export connection state for debugging
export function getConnectionState() {
  return {
    isConnected,
    deviceName: device?.name || null,
    hasCharacteristic: characteristic !== null
  };
}
