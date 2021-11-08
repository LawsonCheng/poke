"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokeClass = void 0;
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable semi */
const https = require("https");
const http = require("http");
const zlib = require("zlib");
const PokeResult_1 = require("./interfaces/PokeResult");
const Query_1 = require("./helpers/Query");
const JSON_1 = require("./helpers/JSON");
const Event_1 = require("./helpers/Event");
/**
 * Usage: https://github.com/LawsonCheng/poke/blob/main/README.md
 *
 * @param host:string The destination of your request pointing to.
 * @param options Specify your method, body, headers etc to customize your request
 * @param callback Callback(result:PokeResult) will be called when the request is completed
 * @returns Promise<PokeResult> | .on('response'|'end'|'data'|'error', callback(result:any)) | pipe(stream:WriteStream)
 */
class PokeClass extends Event_1.EventManagerClass {
    constructor(host, options, callback) {
        super();
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        this.prepareStream = (stream) => stream;
        this.promise = () => new Promise((resolve, reject) => {
            this.makeRequest(result => {
                !PokeResult_1.isPokeError(result) ? resolve(result) : reject(result);
            });
        });
        this.abort = () => {
            var _a, _b;
            if (((_a = this.req) === null || _a === void 0 ? void 0 : _a.destroy) !== undefined) {
                (_b = this.req) === null || _b === void 0 ? void 0 : _b.destroy;
            }
        };
        this.on = (eventName, callback) => {
            this.set(eventName, callback);
            return this;
        };
        this.pipe = (stream) => {
            // listen to stream event
            this.stream(stream);
            // fire request
            this.makeRequest();
            // return Write Stream
            return stream;
        };
        this.host = host;
        this.options = options;
        this.callback = callback;
        this.requestFired = false;
        if (callback !== undefined) {
            this.makeRequest(callback);
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    makeRequest(requestCallback) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        // terminate function if request is fired already
        if (this.requestFired === true)
            return;
        // set request as fired
        this.requestFired = true;
        // get protocol
        const protocol = this.host.substr(0, this.host.indexOf(':'));
        // throw error if this is not a valid protocol
        if (!this.isProtocol(protocol)) {
            throw new Error('url must starts with http:// or https://');
        }
        // get host name of the request url
        let hostname = this.host.split('://').pop() || '';
        // validate hostname
        if (hostname === undefined || hostname === null || hostname.length === 0) {
            throw new Error('hostname is required to poke request.');
        }
        // get full url 
        const full_url = (hostname === null || hostname === void 0 ? void 0 : hostname.split('/')) || [];
        // extract host name
        hostname = full_url.shift() || '';
        // extract path
        let path = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.path) || full_url.join('/');
        // append query string
        path = `/${path}${Object.keys(((_b = this.options) === null || _b === void 0 ? void 0 : _b.query) || {}).length > 0 ? Query_1.stringifyQuery(((_c = this.options) === null || _c === void 0 ? void 0 : _c.query) || {}) : ''}`;
        // get http(s) request handler
        const _http = {
            http,
            https,
        }[protocol];
        // setup success result container
        const result = {
            body: '',
            json: (jsonCallback) => jsonCallback
                ? JSON_1.toJsonWithCallback(result.body, jsonCallback)
                : JSON_1.toJson(result.body)
        };
        // setup request payload
        const payload = {
            method: ((_e = (_d = this.options) === null || _d === void 0 ? void 0 : _d.method) === null || _e === void 0 ? void 0 : _e.toUpperCase()) || 'GET',
            protocol: `${protocol}:`,
            hostname,
            path,
            port: ((_f = this.options) === null || _f === void 0 ? void 0 : _f.port) || (/^https$/.test(protocol) ? 443 : 80),
            headers: ((_g = this.options) === null || _g === void 0 ? void 0 : _g.headers) || {}
        };
        // handle basic auth
        if (((_h = this.options) === null || _h === void 0 ? void 0 : _h.username) !== undefined || ((_j = this.options) === null || _j === void 0 ? void 0 : _j.password) !== undefined) {
            payload.headers = Object.assign(Object.assign({}, payload.headers), { Authorization: `Basic ${Buffer.from(`${((_k = this.options) === null || _k === void 0 ? void 0 : _k.username) || ''}:${((_l = this.options) === null || _l === void 0 ? void 0 : _l.password) || ''}`).toString('base64')}` });
        }
        // fire request
        this.req = _http === null || _http === void 0 ? void 0 : _http.request(payload, res => {
            var _a, _b;
            // save status code
            result.statusCode = res.statusCode;
            // determine whether needs encoding in gzip
            const isGzip = /^gzip$/.test((res.headers || {})['content-encoding'] || '');
            // setup stream preparation
            const _prepareStream = (source) => {
                // handle stream
                this.prepareStream(source)
                    // listen to data event
                    .on('data', d => {
                    result.body = result.body.concat(Buffer.isBuffer(d) ? d.toString() : d);
                    this.data(d);
                })
                    // listen to ent event
                    .on('end', () => {
                    result.headers = res.headers;
                    this.end();
                    this.response(result);
                    if (requestCallback !== undefined) {
                        requestCallback(result);
                    }
                })
                    // listen to error
                    .on('error', (error) => {
                    const error_result = Object.assign(Object.assign({}, result), { error });
                    this.end();
                    this.response(result);
                    if (requestCallback !== undefined) {
                        requestCallback(error_result);
                    }
                });
            };
            // handling gzip
            if ((((_a = this.options) === null || _a === void 0 ? void 0 : _a.gzip) !== undefined && ((_b = this.options) === null || _b === void 0 ? void 0 : _b.gzip) === true) || isGzip === true) {
                const gunzip = zlib.createGunzip();
                res.pipe(gunzip);
                // handles data
                _prepareStream(gunzip);
            }
            else {
                _prepareStream(res);
            }
        });
        // do we need to timeout the request?
        if (((_m = this.options) === null || _m === void 0 ? void 0 : _m.timeout) !== undefined && !isNaN((_o = this.options) === null || _o === void 0 ? void 0 : _o.timeout) && ((_p = this.options) === null || _p === void 0 ? void 0 : _p.timeout) > 0 && result.statusCode === undefined) {
            // setup timeout function
            setTimeout(() => {
                var _a, _b;
                // destroy is no need to call
                if (((_a = this.req) === null || _a === void 0 ? void 0 : _a.end) !== undefined) {
                    // destroy request, error | close event should be emitted automatically
                    (_b = this.req) === null || _b === void 0 ? void 0 : _b.destroy();
                }
            }, this.options.timeout);
        }
        // set 
        (_q = this.req) === null || _q === void 0 ? void 0 : _q.on('error', error => {
            const error_result = Object.assign(Object.assign({}, result), { error });
            if (requestCallback !== undefined)
                requestCallback(error_result);
            // error event listener exists
            this.error(error_result);
        });
        // has body
        if (((_r = this.options) === null || _r === void 0 ? void 0 : _r.body) !== undefined && /^post|put|delete$/i.test(this.options.method || 'GET')) {
            (_s = this.req) === null || _s === void 0 ? void 0 : _s.write(this.options.body || {}); // append body
        }
        // end of the request
        (_t = this.req) === null || _t === void 0 ? void 0 : _t.end(); // req end
        // return PokeResult in callback
        if (this.callback !== undefined) {
            console.log('1');
            // fire request
            this.makeRequest(this.callback);
        }
        else {
            console.log('2');
            return this;
        }
    }
}
exports.PokeClass = PokeClass;
// method to create new Poke instance
const Poke = (host, options, callback) => new PokeClass(host, options, callback);
exports.default = Poke;
