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
/**
 * Usage: https://github.com/LawsonCheng/poke/blob/main/README.md
 *
 * @param host:string The destination of your request pointing to.
 * @param options Specify your method, body, headers etc to customize your request
 * @param callback Callback(result:PokeResult) will be called when the request is completed
 *
 * @returns Promise<PokeResult> | .on('response'|'end'|'data'|'error', callback(result:any)) | pipe(stream:WriteStream)
 */
function Poke(host, options, callback) {
    // the flag to indicate whether request is fired already
    let requestFired = false;
    // set event manager
    const eventManager = Event_1.default();
    // declare PokeReturn
    const _return = {
        promise: () => new Promise((resolve, reject) => {
            // fire request
            makeRequest(result => {
                // callback based on error whether error exists
                !PokeResult_1.isPokeError(result) ? resolve(result) : reject(result);
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
            // assign callback corresponse to event name
            eventManager.set(eventName, callback);
            return _return;
        },
        // set write stream
        pipe: (stream) => {
            eventManager.stream(stream);
            // fire request
            makeRequest(result => { });
        }
    };
    // handler
    const makeRequest = function (requestCallback) {
        var _a, _b, _c, _d;
        console.log('-> makeRequest');
        // if request is already fired, skip
        if (requestFired === true)
            return;
        // noted that request is fired
        requestFired = true;
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
            // parse json function
            json: (jsonCallback) => jsonCallback
                ? JSON_1.toJsonWithCallback(result.body, jsonCallback)
                : JSON_1.toJson(result.body)
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
                result.body = result.body.concat(Buffer.isBuffer(d) ? d.toString() : d);
                // data event listener exists
                eventManager.data(d);
            })
                // completion listner
                .on('end', () => {
                // save headers
                result.headers = res.headers;
                // end event listener exists
                eventManager.end();
                // emit respnse
                eventManager.response(result);
                // callback with result
                requestCallback(result);
            })
                // error listener
                .on('error', error => {
                const error_result = Object.assign(Object.assign({}, result), { error });
                // FIXME we need to call "end" too on error, right?
                // end event listener exists
                eventManager.end();
                // error event listener exists
                eventManager.error(error_result);
                // reject
                requestCallback(error_result);
            });
            // is gzip, decompress gzip response first if yes
            if (((options === null || options === void 0 ? void 0 : options.gzip) !== undefined && (options === null || options === void 0 ? void 0 : options.gzip) === true) || isGzip === true) {
                console.log('> ----- gzip');
                // get gzip
                const gunzip = zlib.createGunzip();
                // pipe response to decompress
                res.pipe(gunzip);
                // handles data
                prepareStream(gunzip);
            }
            // handles non-gzip compressed request
            else {
                console.log('> ----- non gzip');
                prepareStream(res);
            }
        });
        // timeout option is valid and response does not yet to come
        if ((options === null || options === void 0 ? void 0 : options.timeout) !== undefined && !isNaN(options === null || options === void 0 ? void 0 : options.timeout) && (options === null || options === void 0 ? void 0 : options.timeout) > 0 && result.statusCode === undefined) {
            // setup timeout function
            setTimeout(() => {
                var _a;
                // destroy is not ne
                if (((_a = _return.req) === null || _a === void 0 ? void 0 : _a.end) !== undefined) {
                    // destroy request, error | close event should be emitted automatically
                    _return.req.destroy();
                }
            }, options.timeout);
        }
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
        // fire request
        makeRequest(callback);
    }
    return _return;
}
exports.default = Poke;
