"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = void 0;
function toJson(jsonString, callback) {
    // is promise flag
    const isPromise = callback === undefined;
    try {
        // parse json
        let json = JSON.parse(jsonString);
        // return a promise object
        if (isPromise) {
            // resolve with json
            return Promise.resolve(json);
        }
        // callback with error:null, result:json
        else {
            callback && callback(null, json);
        }
    }
    catch (error) {
        // return a promise object
        if (isPromise) {
            // error occurred, reject promise
            return Promise.reject(error);
        }
        // callback with error:null, result:json
        else {
            callback && callback(error, null);
        }
    }
}
exports.toJson = toJson;
