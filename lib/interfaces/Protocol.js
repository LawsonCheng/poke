"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProtocol = void 0;
/**
 *
 * @param input:string The prefix of the protocol
 * Determines whether the protocol is valid
 *
 * @returns Boolean
 */
function isProtocol(input) {
    return /^https?/.test(input);
}
exports.isProtocol = isProtocol;
