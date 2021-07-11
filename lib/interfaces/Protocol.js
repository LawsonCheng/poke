"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProtocol = void 0;
function isProtocol(input) {
    return /^https?/.test(input);
}
exports.isProtocol = isProtocol;
