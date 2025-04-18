import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
// Add TextEncoder polyfill
if (typeof globalThis.TextEncoder === 'undefined') {
    globalThis.TextEncoder = TextEncoder;
    globalThis.TextDecoder = TextDecoder;
}
