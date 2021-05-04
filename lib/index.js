"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const http = require("http");
const Query_1 = require("./helpers/Query");
const JSON_1 = require("./helpers/JSON");
function Poke(host, options, callback) {
    // handler
    const makeRequest = function (resolve, reject) {
        var _a;
        // get protocol
        const protocol = host.substr(0, host.indexOf(':'));
        // get hostname
        const hostname = host.split('://').pop();
        // check protocol
        if (!/^https?/.test(protocol)) {
            throw new Error('url must starts with http:// or https://');
        }
        // determine which http library we should use
        const _http = {
            http,
            https,
        }[protocol];
        // setup result container
        const result = {};
        // setup request payload
        const payload = {
            method: ((_a = options === null || options === void 0 ? void 0 : options.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || 'GET',
            protocol: `${protocol}:`,
            hostname,
            port: (options === null || options === void 0 ? void 0 : options.port) || (/^https$/.test(protocol) ? 443 : 80),
            path: `${(options === null || options === void 0 ? void 0 : options.path) || '/'}${Object.keys((options === null || options === void 0 ? void 0 : options.query) || {}).length > 0 ? Query_1.stringifyQuery((options === null || options === void 0 ? void 0 : options.query) || {}) : ''}`,
            headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
        };
        // is promise flag
        const isPromise = reject !== undefined;
        // prepare request
        const req = _http === null || _http === void 0 ? void 0 : _http.request(payload, res => {
            // set status code
            result.statusCode = res.statusCode;
            // data listener
            res.on('data', d => {
                result.body = result.body || '';
                result.body += d;
            });
            // completion listener
            res.on('end', () => {
                // append parse json function to result body
                result.json = (jsonCallback) => JSON_1.toJson((result.body || ''), jsonCallback);
                // callback with result
                resolve(result);
            });
            // error listener
            res.on('error', error => {
                // set error
                result.error = error;
                // reject
                isPromise ? (reject && reject(result)) : resolve(result);
            });
        });
        // error listener
        req === null || req === void 0 ? void 0 : req.on('error', error => {
            // set error
            result.error = error;
            // reject
            isPromise ? (reject && reject(result)) : resolve(result);
        });
        // has body
        if ((options === null || options === void 0 ? void 0 : options.body) !== undefined && /^post|put|delete$/i.test(options.method || 'GET')) {
            // append body
            req === null || req === void 0 ? void 0 : req.write(options.body || {});
        }
        // req end
        req === null || req === void 0 ? void 0 : req.end();
    };
    // return result in Promise
    if (callback === undefined) {
        return new Promise(makeRequest);
    }
    // return in callback
    else {
        makeRequest(callback);
    }
}
exports.default = Poke;
