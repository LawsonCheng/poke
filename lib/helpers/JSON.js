"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = exports.toJsonWithCallback = void 0;
/**
 *
 * @param jsonString
 * string to parse as json
 *
 * @param callback
 * callback function to return parsed json
 */
function toJsonWithCallback(jsonString, callback) {
    try {
        // parse json
        const json = JSON.parse(jsonString);
        // callback with error:null, result:json
        callback(null, json);
    }
    catch (error) {
        const _error = error;
        // callback with error:null, result:json
        callback(_error, null);
    }
}
exports.toJsonWithCallback = toJsonWithCallback;
/**
 *
 * @param jsonString
 * @returns Promise with json object parsed or Error object
 */
function toJson(jsonString) {
    try {
        // parse json
        const json = JSON.parse(jsonString);
        return Promise.resolve(json); // resolve with json
    }
    catch (error) {
        return Promise.reject(error); // error occurred, reject promise
    }
}
exports.toJson = toJson;
