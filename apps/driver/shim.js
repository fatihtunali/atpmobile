// Polyfill SharedArrayBuffer for Hermes before any modules load
if (typeof globalThis.SharedArrayBuffer === 'undefined') {
  globalThis.SharedArrayBuffer = ArrayBuffer;
}
if (typeof global.SharedArrayBuffer === 'undefined') {
  global.SharedArrayBuffer = ArrayBuffer;
}
