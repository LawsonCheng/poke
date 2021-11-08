import * as https from 'https'
import * as http from 'http'
import * as zlib from 'zlib'
import { WriteStream } from 'fs'
import { ServerResponse } from 'http'
import PokeOption from './interfaces/PokeOption'
import PokeReturn from './interfaces/PokeReturn'
import PokeResult, { isPokeError, PokeSuccess } from './interfaces/PokeResult'
import { stringifyQuery } from './helpers/Query'
import { JSONCallback, toJson, toJsonWithCallback } from './helpers/JSON'
import { EventManagerClass } from './helpers/Event'

/**
 * Class of "Poke"
 */
export class PokeClass extends EventManagerClass {

    // host: The full url of the request's destination
    host: string
    // Customize Poke request
    options?: PokeOption<Body>
    // The callback function called if you may not want to use Promise
    callback?: (pr: PokeResult) => void
    // A flag to prevent duplicated requests
    requestFired: boolean
    // The request body reference
    req?:http.ClientRequest

    /**
     * Constructor
     * @param host required. https://foo.com/api
     * @param options optional
     * @param callback optional
     */
    constructor(host: string, options?: PokeOption<Body>, callback?:(pr:PokeResult) => void) {
        super()
        this.host = host
        this.options = options
        this.callback = callback 
        this.requestFired = false
        if(callback !== undefined) {
            this.makeRequest(callback)
        }
    }

    /**
     * @private Handling stream response
     * @param stream:pipe 
     * @returns http.Incomingmessage|zlib.Gunzip
     */
    private prepareStream = (stream: http.IncomingMessage | zlib.Gunzip) => stream; 

    /**
     * @private Main body to hanlding the request
     * @param requestCallback:
     * @returns 
     */
    private makeRequest(requestCallback?:(pokeResult: PokeResult) => void):this|void {
        // terminate function if request is fired already
        if(this.requestFired === true) return 
        // set request as fired
        this.requestFired = true
        // get protocol
        const protocol =  this.host.substr(0, this.host.indexOf(':'))
        // throw error if this is not a valid protocol
        if(!this.isProtocol(protocol)){
            throw new Error('url must starts with http:// or https://')
        }
        // get host name of the request url
        let hostname:string = this.host.split('://').pop() || ''
        // validate hostname
        if(hostname === undefined || hostname === null || hostname.length === 0) {
            throw new Error('hostname is required to poke request.')
        }
        // get full url 
        const full_url:Array<string> = hostname?.split('/') || []
        // extract host name
        hostname = full_url.shift() || '' 
        // extract path
        let path = this.options?.path || full_url.join('/')
        // append query string
        path = `/${path}${Object.keys(this.options?.query || {}).length > 0 ? stringifyQuery(this.options?.query || {}) : ''}`
        // get http(s) request handler
        const _http = {
            http,
            https, 
        }[protocol]
        // setup success result container
        const result:PokeSuccess = {
            body: '', 
            json: <Result>(jsonCallback?: JSONCallback<Result>) => jsonCallback
                ? toJsonWithCallback<Result>(result.body, jsonCallback)
                : toJson<Result>(result.body)
        }
        // setup request payload
        const payload = {
            method : this.options?.method?.toUpperCase() || 'GET',
            protocol : `${protocol}:`,
            hostname,
            path,
            port : this.options?.port || (/^https$/.test(protocol) ? 443 : 80),
            headers : this.options?.headers || {}
        }
        // handle basic auth
        if(this.options?.username !== undefined || this.options?.password !== undefined) {
            payload.headers = {
                ...payload.headers,
                Authorization : `Basic ${Buffer.from(`${this.options?.username || ''}:${this.options?.password || ''}`).toString('base64')}`
            }
        }
        // fire request
        this.req = _http?.request(payload, res => {
            // save status code
            result.statusCode = res.statusCode
            // determine whether needs encoding in gzip
            const isGzip = /^gzip$/.test((res.headers || {})['content-encoding'] || '')
            // setup stream preparation
            const _prepareStream = (source:zlib.Gunzip|http.IncomingMessage) => {
                // handle stream
                this.prepareStream(source)
                // listen to data event
                .on('data', d => {
                    result.body = result.body.concat(Buffer.isBuffer(d) ? d.toString() : d)
                    this.data(d)
                })
                // listen to ent event
                .on('end', () => {
                    result.headers  = res.headers
                    this.end()
                    this.response(result)
                    if(requestCallback !== undefined) {
                        requestCallback(result)
                    }
                })
                // listen to error
                .on('error', (error) => {
                    const error_result = { ...result, error }
                    this.end()
                    this.response(result)
                    if(requestCallback !== undefined) {
                        requestCallback(error_result)
                    }
                })
            }
            // handling gzip
            if((this.options?.gzip !== undefined && this.options?.gzip === true) || isGzip === true) {
                const gunzip = zlib.createGunzip()
                res.pipe(gunzip)
                // handles data
                _prepareStream(gunzip)
            }else {
                _prepareStream(res)
            }
        })
        // do we need to timeout the request?
        if(this.options?.timeout !== undefined && !isNaN(this.options?.timeout) && this.options?.timeout > 0 && result.statusCode === undefined) {
            // setup timeout function
            setTimeout(() => {
                // destroy is no need to call
                if(this.req?.end !== undefined) {
                    // destroy request, error | close event should be emitted automatically
                    this.req?.destroy()
                }
            }, this.options.timeout)
        }
        // set 
        this.req?.on('error', error => {
            const error_result = { ...result, error }
            if(requestCallback !== undefined)  requestCallback(error_result)
            // error event listener exists
            this.error(error_result)  
        })
        // has body
        if(this.options?.body !== undefined && /^post|put|delete$/i.test(this.options.method || 'GET')) {
            this.req?.write(this.options.body || {})    // append body
        }
        // end of the request
        this.req?.end()    // req end
        // return PokeResult in callback
        if(this.callback !== undefined) {
            // fire request
            this.makeRequest(this.callback)
        } else {
            return this
        }
    }

    /**
     * Returns the request in the form of Promise()
     * @returns Promise<PokeSuccess>
     */
    public promise = ():Promise<PokeSuccess> => new Promise((resolve, reject) => {
        this.makeRequest(result => {
            !isPokeError(result) ? resolve(result) : reject(result)
        })
    })

    /**
     * Terminate request if it's not completed yet
     */
    public abort = ():void => {
        if(this.req?.destroy !== undefined) {
            this.req?.destroy
        }
    }
    
    /**
     * Listening to various of events of the request
     * @param eventName 
     * @param callback 
     * @returns 
     */
    public on = (eventName:string, callback:() => void):this => {
        this.set(eventName, callback); 
        return this;  
    }

    /**
     * Pipe response
     * @param stream
     * @returns 
     */
    public pipe = (stream):WriteStream|ServerResponse => {
         // listen to stream event
         this.stream(stream)
         // fire request
         this.makeRequest()
         // return Write Stream
         return stream
    }
    
}



/**
 * Usage: https://github.com/LawsonCheng/poke/blob/main/README.md
 * 
 * @param host:string The destination of your request pointing to.
 * @param options Specify your method, body, headers etc to customize your request
 * @param callback Callback(result:PokeResult) will be called when the request is completed
 * @returns Promise<PokeResult> | .on('response'|'end'|'data'|'error', callback(result:any)) | pipe(stream:WriteStream)
 */
const Poke = (host: string, options?: PokeOption<Body>, callback?:(pr:PokeResult) => void):PokeClass => new PokeClass(host, options, callback)

export default Poke
