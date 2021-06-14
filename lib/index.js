"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const http = require("http");
const Query_1 = require("./helpers/Query");
const JSON_1 = require("./helpers/JSON");
function Poke(host, options, callback) {
    // alias of the request
    let req;
    // handler
    const makeRequest = function (requestCallback) {
        var _a;
        // get protocol
        const protocol = host.substr(0, host.indexOf(':'));
        // check protocol
        if (!/^https?/.test(protocol)) {
            throw new Error('url must starts with http:// or https://');
        }
        // get hostname
        let hostname = host.split('://').pop() || '';
        // make sure hostname is valid
        if (hostname === undefined || hostname === null || hostname.length === 0) {
            throw new Error('hostname is required to poke request.');
        }
        // let's breakdown the full url into domain and path
        const full_url = (hostname === null || hostname === void 0 ? void 0 : hostname.split('/')) || [];
        // get hostname by removing the first element
        hostname = full_url.shift() || '';
        // get path from options.path, join the rest elements if options.path does not exist
        let path = (options === null || options === void 0 ? void 0 : options.path) || full_url.join('/');
        // append querys
        path = `/${path}${Object.keys((options === null || options === void 0 ? void 0 : options.query) || {}).length > 0 ? Query_1.stringifyQuery((options === null || options === void 0 ? void 0 : options.query) || {}) : ''}`;
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
            path,
            port: (options === null || options === void 0 ? void 0 : options.port) || (/^https$/.test(protocol) ? 443 : 80),
            headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
        };
        // need to handle basic auth
        if ((options === null || options === void 0 ? void 0 : options.username) !== undefined || (options === null || options === void 0 ? void 0 : options.password) !== undefined) {
            payload.headers = Object.assign(Object.assign({}, payload.headers), { Authorization: `Basic ${Buffer.from(`${(options === null || options === void 0 ? void 0 : options.username) || ''}:${(options === null || options === void 0 ? void 0 : options.password) || ''}`).toString('base64')}` });
        }
        // prepare request
        req = _http === null || _http === void 0 ? void 0 : _http.request(payload, res => {
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
                // save headers
                result.headers = res.headers;
                // callback with result
                requestCallback(result);
            });
            // error listener
            res.on('error', error => {
                // set error
                result.error = error;
                // reject
                requestCallback(result);
            });
        });
        // error listener
        req === null || req === void 0 ? void 0 : req.on('error', error => {
            // set error
            result.error = error;
            // reject
            requestCallback(result);
        });
        // has body
        if ((options === null || options === void 0 ? void 0 : options.body) !== undefined && /^post|put|delete$/i.test(options.method || 'GET')) {
            // append body
            req === null || req === void 0 ? void 0 : req.write(options.body || {});
        }
        // req end
        req === null || req === void 0 ? void 0 : req.end();
    };
    // return PokeResult in callback
    if (callback !== undefined) {
        makeRequest(callback);
    }
    // declare PokeReturn
    const _return = {
        promise: () => new Promise((resolve, reject) => {
            makeRequest(result => {
                // callback based on error whether error exists
                result.error !== undefined ? reject(result) : resolve(result);
            });
        }),
        abort: () => {
            // ensure the destroy function is available
            if ((req === null || req === void 0 ? void 0 : req.destroy) !== undefined) {
                req.destroy();
            }
        }
    };
    return _return;
}
exports.default = Poke;
