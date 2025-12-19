// Polyfill SharedArrayBuffer for Hermes (React Native JS engine)
// This is needed because whatwg-url-without-unicode uses it
if (typeof global.SharedArrayBuffer === 'undefined') {
  global.SharedArrayBuffer = ArrayBuffer;
}

// Import expo-router entry point
import 'expo-router/entry';
