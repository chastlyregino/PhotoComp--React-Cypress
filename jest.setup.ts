import '@testing-library/jest-dom';

// Add TextEncoder polyfill
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

// Add this line to extend expect
import { expect } from '@jest/globals';
