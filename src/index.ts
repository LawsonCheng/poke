import * as https from 'https'
import * as http from 'http'
import * as zlib from 'zlib'
import PokeOption from './interfaces/PokeOption'
import PokeReturn from './interfaces/PokeReturn'
import PokeResult, { JSONCallback } from './interfaces/PokeResult'
import { stringifyQuery } from './helpers/Query'
import { toJson } from './helpers/JSON'

function Poke (host:string, options?:PokeOption, callback?:(PokeResult) => void):PokeReturn {

    // declare listeners
    const listeners = {}

    // the flag to indicate whether request is fired already
    let requestFired = false

    // declare PokeReturn
    const _return:PokeReturn = {
        req: undefined,
        promise: () => new Promise<PokeResult>((resolve, reject) => {
            makeRequest(result => {
                // callback based on error whether error exists
                result.error !== undefined ? reject(result) : resolve(result)
            })
        }),
        abort: () => {
            // ensure the destroy function is available
            if(_return.req !== undefined && _return.req?.destroy !== undefined) {
                _return.req.destroy()
            }
        },
        on: (eventName, callback) => {
            // valid event name?
            if(/^data|error|response|end$/.test(eventName)) {
                // assign listener to listeners container
                listeners[eventName] = callback
            }
            // check request is fired on not
            if(requestFired === false) {
                // fire request
                makeRequest(result => {
                    // error exists AND error event listener exists
                    if(result.error !== undefined && listeners['error'] !== undefined && /^function$/.test(typeof listeners['error'])) {                        
                        // return response object
                        listeners['error'](result)
                    } 
                    // no error
                    else {
                        // response event listener exists
                        if(listeners['response'] !== undefined && /^function$/.test(typeof listeners['response'])) {
                            // return response object
                            listeners['response'](result)
                        }
                        // end event listener exists
                        if(listeners['end'] !== undefined && /^function$/.test(typeof listeners['end'])) {
                            // return response object
                            listeners['end']()
                        }
                    }
                })
                // noted that request is fired
                requestFired = true
            }
            return _return
        },
        pipe: (stream) => {

        }
    }

    // handler
    const makeRequest = function(requestCallback:(pokeResult: PokeResult) => void) {
        // get protocol
        const protocol = host.substr(0, host.indexOf(':'))
        // check protocol
        if(!/^https?/.test(protocol)) {
            throw new Error('url must starts with http:// or https://')
        }
        // get hostname
        let hostname:string = host.split('://').pop() || ''
        // make sure hostname is valid
        if(hostname === undefined || hostname === null || hostname.length === 0) {
            throw new Error('hostname is required to poke request.')
        }
        // let's breakdown the full url into domain and path
        const full_url:Array<string> = hostname?.split('/') || []
        // get hostname by removing the first element
        hostname = full_url.shift() || ''
        // get path from options.path, join the rest elements if options.path does not exist
        let path:string = options?.path || full_url.join('/')
        // append querys
        path = `/${path}${Object.keys(options?.query || {}).length > 0 ? stringifyQuery(options?.query || {}) : ''}`
        // determine which http library we should use
        const _http = {
            http,
            https, 
        }[protocol]
        // setup result container
        const result:PokeResult = {}
        // setup request payload
        const payload = {
            method : options?.method?.toUpperCase() || 'GET',
            protocol : `${protocol}:`,
            hostname,
            path,
            port : options?.port || (/^https$/.test(protocol) ? 443 : 80),
            headers : options?.headers || {}
        }
        // need to handle basic auth
        if(options?.username !== undefined || options?.password !== undefined) {
            payload.headers = {
                ...payload.headers,
                Authorization : `Basic ${Buffer.from(`${options?.username || ''}:${options?.password || ''}`).toString('base64')}`
            }
        }
        // prepare request and save it to pokeReturn
        _return.req = _http?.request(payload, res => {
            // set status code
            result.statusCode = res.statusCode
            // does response header indicates that using gzip?
            const isGzip = /^gzip$/.test((res.headers || {})['content-encoding'] || '')
            // is gzip?
            if((options?.gzip !== undefined && options?.gzip === true) || isGzip === true) {
                // get gzip
                let gunzip = zlib.createGunzip();
                // pipe response to decompress
                res.pipe(gunzip)
                // handles data
                gunzip.on('data', d => {
                    // decompression chunk ready, add it to the buffer
                    result.body = result.body || ''
                    result.body += d
                    // data event listener exists
                    if(listeners['data'] !== undefined && /^function$/.test(typeof listeners['data'])) {
                        // return data chunk
                        listeners['data'](d)
                    }
                })
                // completion listner
                .on("end", () => {
                    // append parse json function to result body
                    result.json = (jsonCallback?:JSONCallback) => toJson((result.body || ''), jsonCallback)
                    // save headers
                    result.headers = res.headers
                    // callback with result
                    requestCallback(result)
        
                }).on("error", error => {
                    // set error
                    result.error = error
                    // reject
                    requestCallback(result)
                })
            } 
            // decompress gzip response
            else {
                // data listener
                res.on('data', d => {
                    result.body = result.body || ''
                    result.body += d
                    // data event listener exists
                    if(listeners['data'] !== undefined && /^function$/.test(typeof listeners['data'])) {
                        // return data chunk
                        listeners['data'](d)
                    }
                })
                // completion listener
                .on('end', () => {
                    // append parse json function to result body
                    result.json = (jsonCallback?:JSONCallback) => toJson((result.body || ''), jsonCallback)
                    // save headers
                    result.headers = res.headers
                    // callback with result
                    requestCallback(result)
                })
                // error listener
                .on('error', error => {
                    // set error
                    result.error = error
                    // reject
                    requestCallback(result)
                })
            }
        })
        // error listener
        _return.req?.on('error', error => {
            // set error
            result.error = error
            // reject
            requestCallback(result)
            // error event listener exists
            if(listeners['error'] !== undefined && /^function$/.test(typeof listeners['error'])) {
                // return response object
                listeners['error'](result)
            }
        })
        // has body
        if(options?.body !== undefined && /^post|put|delete$/i.test(options.method || 'GET')) {
            // append body
            _return.req?.write(options.body || {})
        }
        // req end
        _return.req?.end()
    }

    // return PokeResult in callback
    if(callback !== undefined) {
        makeRequest(callback)
    }

    return _return
}

export default Poke