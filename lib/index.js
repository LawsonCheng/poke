"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const http = require("http");
const zlib = require("zlib");
const PokeResult_1 = require("./interfaces/PokeResult");
const Query_1 = require("./helpers/Query");
const JSON_1 = require("./helpers/JSON");
const Event_1 = require("./helpers/Event");
const Protocol_1 = require("./interfaces/Protocol");
function Poke(host, options, callback) {
    // the flag to indicate whether request is fired already
    let requestFired = false;
    // set event manager
    const eventManager = Event_1.default();
    // declare PokeReturn
    const _return = {
        promise: () => new Promise((resolve, reject) => {
            makeRequest(result => {
                // callback based on error whether error exists
                // NOTE: ts seems not able to infer the reject part as PokeError but it doesn't matter in pratice
                // NOTE: probably due to the mixing use of genric and typeguard and tsc is not smart enough for that?
                PokeResult_1.isPokeSuccess(result) ? resolve(result) : reject(result);
            });
        }),
        abort: () => {
            var _a;
            // ensure the destroy function is available
            if (((_a = _return.req) === null || _a === void 0 ? void 0 : _a.destroy) !== undefined) {
                _return.req.destroy();
            }
        },
        on: (eventName, callback) => {
            // valid event name?
            if (/^data|error|response|end$/.test(eventName)) {
                // assign callback corresponse to event name
                eventManager.set(eventName, callback);
            }
            // check request is fired on not
            if (requestFired === false) {
                // fire request
                makeRequest(result => {
                    // error exists AND error event listener exists
                    if (PokeResult_1.isPokeError(result)) {
                        // return response object
                        eventManager.error(result);
                    }
                    // no error
                    else {
                        // emit respnse
                        // NOTE: ts seems not able to infer the result type but it doesn't matter in pratice
                        // NOTE: probably due to the mixing use of genric and typeguard and tsc is not powerful enough for that?
                        eventManager.response(result);
                        // emit end event
                        eventManager.end();
                    }
                    // end stream
                    eventManager.stream.end();
                });
                // noted that request is fired
                requestFired = true;
            }
            return _return;
        },
        pipe: (stream) => {
            // set write stream
            eventManager.stream.set(stream);
            // check request is fired on not
            if (requestFired === false) {
                // start request
                makeRequest(_ => {
                    // end stream
                    eventManager.stream.end();
                });
                // noted that request is fired
                requestFired = true;
            }
        }
    };
    // handler
    const makeRequest = function (requestCallback) {
        var _a, _b, _c, _d;
        // get protocol
        const protocol = host.substr(0, host.indexOf(':'));
        // check protocol
        if (!Protocol_1.isProtocol(protocol)) {
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
        const result = {
            body: '',
            json: jsonCallback => jsonCallback ? JSON_1.toJson('', jsonCallback) : JSON_1.toJson('')
        };
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
        // prepare request and save it to pokeReturn
        _return.req = _http.request(payload, res => {
            // set status code
            result.statusCode = res.statusCode;
            // does response header indicates that using gzip?
            const isGzip = /^gzip$/.test((res.headers || {})['content-encoding'] || '');
            const prepareStream = (stream) => stream
                // data listener
                .on('data', d => {
                // decompression chunk ready, add it to the buffer
                result.body += d;
                // data event listener exists
                eventManager.data(d);
                // emit to stream
                eventManager.stream.write(d);
            })
                // completion listner
                .on('end', () => {
                // append parse json function to result body
                result.json = jsonCallback => jsonCallback ? JSON_1.toJson(result.body, jsonCallback) : JSON_1.toJson(result.body);
                // save headers
                result.headers = res.headers;
                // callback with result
                requestCallback(result);
            })
                // error listener
                .on('error', error => {
                // reject
                requestCallback(Object.assign(Object.assign({}, result), { error }));
            });
            // is gzip, decompress gzip response first if yes
            if (((options === null || options === void 0 ? void 0 : options.gzip) !== undefined && (options === null || options === void 0 ? void 0 : options.gzip) === true) || isGzip === true) {
                // get gzip
                const gunzip = zlib.createGunzip();
                // pipe response to decompress
                res.pipe(gunzip);
                // handles data
                prepareStream(gunzip);
            }
            // handles non-gzip compressed request
            else {
                prepareStream(res);
            }
        });
        // error listener
        (_b = _return.req) === null || _b === void 0 ? void 0 : _b.on('error', error => {
            const error_result = Object.assign(Object.assign({}, result), { error });
            // reject
            requestCallback(error_result);
            // error event listener exists
            eventManager.error(error_result);
        });
        // has body
        if ((options === null || options === void 0 ? void 0 : options.body) !== undefined && /^post|put|delete$/i.test(options.method || 'GET')) {
            // append body
            (_c = _return.req) === null || _c === void 0 ? void 0 : _c.write(options.body || {});
        }
        // req end
        (_d = _return.req) === null || _d === void 0 ? void 0 : _d.end();
    };
    // return PokeResult in callback
    if (callback !== undefined) {
        makeRequest(callback);
    }
    return _return;
}
exports.default = Poke;
