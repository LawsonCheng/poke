import * as https from 'https'
import * as http from 'http'
import * as zlib from 'zlib'
import PokeOption from './interfaces/PokeOption'
import PokeReturn from './interfaces/PokeReturn'
import PokeResult, { isPokeError, PokeSuccess } from './interfaces/PokeResult'
import { stringifyQuery } from './helpers/Query'
import { JSONCallback, toJson, toJsonWithCallback } from './helpers/JSON'
import initEventManager from './helpers/Event'
import { isProtocol } from './interfaces/Protocol'

/**
 * Usage: https://github.com/LawsonCheng/poke/blob/main/README.md
 * 
 * @param host:string The destination of your request pointing to.
 * @param options Specify your method, body, headers etc to customize your request
 * @param callback Callback(result:PokeResult) will be called when the request is completed
 * 
 * @returns Promise<PokeResult> | .on('response'|'end'|'data'|'error', callback(result:any)) | pipe(stream:WriteStream)
 */
function Poke<Body>(host:string, options?:PokeOption<Body>, callback?:(pr: PokeResult) => void):PokeReturn {

    // the flag to indicate whether request is fired already
    let requestFired = false

    // set event manager
    const eventManager = initEventManager()

    // declare PokeReturn
    const _return:PokeReturn = {
        promise: () => new Promise((resolve, reject) => {
            // fire request
            makeRequest(result => {
                // callback based on error whether error exists
                !isPokeError(result)? resolve(result): reject(result)
            })
        }),
        abort: () => {
            // ensure the destroy function is available
            if(_return.req?.destroy !== undefined) {
                _return.req.destroy()
            }
        },
        on: (eventName, callback) => {
            // assign callback corresponse to event name
            eventManager.set(eventName, callback)
            return _return
        },
        // set write stream
        pipe: eventManager.stream
    }

    // handler
    const makeRequest = function(requestCallback:(pokeResult: PokeResult) => void) {
        // if request is already fired, skip
        if(requestFired === true) return
        // noted that request is fired
        requestFired = true
        // get protocol
        const protocol = host.substr(0, host.indexOf(':'))
        // check protocol
        if(!isProtocol(protocol)) {
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
        let path = options?.path || full_url.join('/')
        // append querys
        path = `/${path}${Object.keys(options?.query || {}).length > 0 ? stringifyQuery(options?.query || {}) : ''}`
        // determine which http library we should use
        const _http = {
            http,
            https, 
        }[protocol]

        // setup result container
        const result:PokeSuccess = {
            body: '',
            // parse json function
            json: <Result>(jsonCallback?: JSONCallback<Result>) => jsonCallback
                ? toJsonWithCallback<Result>(result.body, jsonCallback)
                : toJson<Result>(result.body)
        }
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
        _return.req = _http.request(payload, res => {
            // set status code
            result.statusCode = res.statusCode
            // does response header indicates that using gzip?
            const isGzip = /^gzip$/.test((res.headers || {})['content-encoding'] || '')

            const prepareStream = (stream: http.IncomingMessage | zlib.Gunzip) => stream
                // data listener
                .on('data', d => {
                    // decompression chunk ready, add it to the buffer
                    result.body += d
                    // data event listener exists
                    eventManager.data(d)
                })
                // completion listner
                .on('end', () => {
                    // save headers
                    result.headers = res.headers
                    // end event listener exists
                    eventManager.end()
                    // emit respnse
                    eventManager.response(result)
                    // callback with result
                    requestCallback(result)
                })
                // error listener
                .on('error', error => {
                    const error_result = { ...result, error }
                    // FIXME we need to call "end" too on error, right?
                    // end event listener exists
                    eventManager.end()
                    // error event listener exists
                    eventManager.error(error_result)
                    // reject
                    requestCallback(error_result)
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
            const error_result = { ...result, error }
            // reject
            requestCallback(error_result)
            // error event listener exists
            eventManager.error(error_result)
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
        // note that request is fired
        requestFired = true
        // fire request
        makeRequest(callback)
    }

    return _return
}

export default Poke
