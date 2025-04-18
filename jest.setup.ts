// This file extends Jest's expect
import '@testing-library/jest-dom';

// Add TextEncoder polyfill
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

// Extend Jest matchers
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toHaveTextContent(content: string | RegExp): R;
            toHaveAttribute(attr: string, value?: string): R;
            toHaveClass(className: string): R;
            toHaveValue(value: string | number | string[]): R;
            toContainElement(element: HTMLElement | null): R;
            toBeDisabled(): R;
        }
    }
}