import * as https from 'https'
import * as http from 'http'
import * as zlib from 'zlib'
import PokeOption from './interfaces/PokeOption'
import PokeReturn from './interfaces/PokeReturn'
import PokeResult, { JSONCallback } from './interfaces/PokeResult'
import { stringifyQuery } from './helpers/Query'
import { toJson } from './helpers/JSON'
import Event from './helpers/Event'

function Poke<Body>(host:string, options?:PokeOption<Body>, callback?:(pr: PokeResult) => void):PokeReturn {

    // the flag to indicate whether request is fired already
    let requestFired = false

    // set event manager
    const eventManager = Event()

    // declare PokeReturn
    const _return:PokeReturn = {
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
                // assign callback corresponse to event name
                eventManager.set(eventName, callback)
            }
            // check request is fired on not
            if(requestFired === false) {
                // fire request
                makeRequest(result => {
                    // error exists AND error event listener exists
                    if(result.error !== undefined) {
                        // return response object
                        eventManager.error(result)
                    }
                    // no error
                    else {
                        // emit respnse
                        eventManager.response(result)
                        // emit end event
                        eventManager.end()
                    }
                    // end stream
                    eventManager.stream.end()
                })
                // noted that request is fired
                requestFired = true
            }
            return _return
        },
        pipe: (stream) => {
            // set write stream
            eventManager.stream.set(stream)
            // check request is fired on not
            if(requestFired === false) {
                // start request
                makeRequest(result => {
                    // end stream
                    eventManager.stream.end()
                })
                // noted that request is fired
                requestFired = true
            }
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

            const prepareStream = (stream: http.IncomingMessage | zlib.Gunzip) => stream
                // data listener
                    .on('data', d => {
                        // decompression chunk ready, add it to the buffer
                        result.body = result.body || ''
                        result.body += d
                        // data event listener exists
                        eventManager.data(d)
                        // emit to stream
                        eventManager.stream.write(d)
                    })
                // completion listner
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

            // is gzip, decompress gzip response first if yes
            if((options?.gzip !== undefined && options?.gzip === true) || isGzip === true) {
                // get gzip
                const gunzip = zlib.createGunzip()
                // pipe response to decompress
                res.pipe(gunzip)
                // handles data
                prepareStream(gunzip)
            }
            // handles non-gzip compressed request
            else {
                prepareStream(res)
            }
        })
        // error listener
        _return.req?.on('error', error => {
            // set error
            result.error = error
            // reject
            requestCallback(result)
            // error event listener exists
            eventManager.error(result)
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