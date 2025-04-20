import '@testing-library/jest-dom';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Add TextEncoder polyfill
if (typeof globalThis.TextEncoder === 'undefined') {
    globalThis.TextEncoder = TextEncoder as any;
    globalThis.TextDecoder = TextDecoder as any;
}
