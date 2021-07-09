"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = void 0;
function toJson(jsonString, callback) {
    if (callback === undefined) {
        try {
            // parse json
            const json = JSON.parse(jsonString);
            // resolve with json
            return Promise.resolve(json);
        }
        catch (error) {
            // error occurred, reject promise
            return Promise.reject(error);
        }
    }
    else {
        try {
            // parse json
            const json = JSON.parse(jsonString);
            // callback with error:null, result:json
            callback(null, json);
        }
        catch (error) {
            // callback with error:null, result:json
            callback(error, null);
        }
    }
}
exports.toJson = toJson;
