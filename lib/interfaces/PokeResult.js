"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPokeError = void 0;
/**
 * Determines the result is PokeError or not
 * @param input:PokeError|PokeSuccess
 * @returns Boolean
 */
function isPokeError(input) {
    return input['error'] !== undefined;
}
exports.isPokeError = isPokeError;
