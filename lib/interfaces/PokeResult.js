"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPokeError = exports.isPokeSuccess = void 0;
function isPokeSuccess(input) {
    return input.error == undefined;
}
exports.isPokeSuccess = isPokeSuccess;
function isPokeError(input) {
    return input.error != undefined;
}
exports.isPokeError = isPokeError;
