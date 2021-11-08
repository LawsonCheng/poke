/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable semi */
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
import initEventManager, { EventManagerClass } from './helpers/Event'
import { abort, eventNames } from 'process'
import { resolve } from 'path/posix'
// import { isProtocol } from './interfaces/Protocol'

/**
 * Usage: https://github.com/LawsonCheng/poke/blob/main/README.md
 * 
 * @param host:string The destination of your request pointing to.
 * @param options Specify your method, body, headers etc to customize your request
 * @param callback Callback(result:PokeResult) will be called when the request is completed
 * @returns Promise<PokeResult> | .on('response'|'end'|'data'|'error', callback(result:any)) | pipe(stream:WriteStream)
 */


export class PokeClass extends EventManagerClass {
    host: string; 
    options?: PokeOption<Body>; 
    callback?: (pr: PokeResult) => void; 
    requestFired: boolean; 

    constructor(host: string, options?: PokeOption<Body>, callback?:(pr:PokeResult) => void) {
        super()
        this.host = host
        this.options = options
        this.callback = callback 
        this.requestFired = false 
    }


    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private prepareStream = (stream: http.IncomingMessage | zlib.Gunzip) => stream; 

    public _return = ():PokeReturn => {
      const data = {
            promise: (): Promise<PokeSuccess> => new Promise((resolve, reject) => {
                this.makeRequest(result => {
                    !isPokeError(result) ? resolve(result) : reject(result)
                })
            }), 

            abort: (): void => {
                if(this._return().req?.destroy !== undefined) {
                    this._return().req?.destroy
                }
            },

            on: (eventName, callback):PokeReturn => {
                this.set(eventName, callback); 
                return callback;  
            }, 

            pipe: (stream):WriteStream|ServerResponse => {
                 // listen to stream event
                 this.stream(stream)
                 // fire request
                 this.makeRequest()
                 // return Write Stream
                 return stream
            }, 


       }; 

       return data; 
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public makeRequest (requestCallback?:(pokeResult: PokeResult) => void) {
        if(this.requestFired === true) return 
        this.requestFired = true


        this._return()
        // const _return:PokeReturn = {
        //     promise: () => new Promise((resolve, reject) => {
        //         // fire request
        //         this.makeRequest(result => {
        //             // callback based on error whether error exists
        //             !isPokeError(result)? resolve(result): reject(result)
        //         })
        //     }),
    
        //     abort: () => {
        //         // ensure the destroy function is available
        //         if(_return.req?.destroy !== undefined) {
        //             _return.req.destroy()
        //         }
        //     },
        //     on: (eventName, callback) => {
        //         // assign callback corresponse to event name
        //         this.set(eventName, callback)
        //         return _return
        //     },
        //     // set write stream
        //     pipe: (stream) => {
        //         // listen to stream event
        //         this.stream(stream)
        //         // fire request
        //         this.makeRequest()
        //         // return Write Stream
        //         return stream
        //     }
        // }

        const protocol =  this.host.substr(0, this.host.indexOf(':'))
        
        if(!this.isProtocol(protocol)){
            throw new Error('url must starts with http:// or https://')
        }

        let hostname:string = this.host.split('://').pop() || ''
        if(hostname === undefined || hostname === null || hostname.length === 0) {
            throw new Error('hostname is required to poke request.')
        }

        const full_url:Array<string> = hostname?.split('/') || []
        hostname = full_url.shift() || '' 
        let path = this.options?.path || full_url.join('/')
        path = `/${path}${Object.keys(this.options?.query || {}).length > 0 ? stringifyQuery(this.options?.query || {}) : ''}`
        
        const _http = {
            http,
            https, 
        }[protocol]

        const result:PokeSuccess = {
            body: '', 
            json: <Result>(jsonCallback?: JSONCallback<Result>) => jsonCallback
                ? toJsonWithCallback<Result>(result.body, jsonCallback)
                : toJson<Result>(result.body)
        }


        const payload = {
            method : this.options?.method?.toUpperCase() || 'GET',
            protocol : `${protocol}:`,
            hostname,
            path,
            port : this.options?.port || (/^https$/.test(protocol) ? 443 : 80),
            headers : this.options?.headers || {}
        }

        if(this.options?.username !== undefined || this.options?.password !== undefined) {
            payload.headers = {
                ...payload.headers,
                Authorization : `Basic ${Buffer.from(`${this.options?.username || ''}:${this.options?.password || ''}`).toString('base64')}`
            }
        } 

        _http?.request(payload, res => {
            result.statusCode = res.statusCode //statusCode 
            const isGzip = /^gzip$/.test((res.headers || {})['content-encoding'] || '')
            // const prepareStream = (stream: http.IncomingMessage | zlib.Gunzip) => stream
            this.prepareStream(res)
                .on('data', d => {
                    result.body = result.body.concat(Buffer.isBuffer(d) ? d.toString() : d)
                    this.data(d)
                })

                .on('end', () => {
                    result.headers  = res.headers
                    this.end()
                    this.response(result)

                    if(requestCallback !== undefined) {
                        requestCallback(result)
                    }
                })

                .on('error', (error) => {
                    const error_result = { ...result, error }
                    this.end()
                    this.response(result)
                    if(requestCallback !== undefined) {
                        requestCallback(error_result)
                    }
                })

            if((this.options?.gzip !== undefined && this.options?.gzip === true) || isGzip === true) {
                const gunzip = zlib.createGunzip()
                res.pipe(gunzip)
                // handles data
                this.prepareStream(gunzip)
                 
            }else {
                this.prepareStream(res)
            }


        })

        if(this.options?.timeout !== undefined && !isNaN(this.options?.timeout) && this.options?.timeout > 0 && result.statusCode === undefined) {
            // setup timeout function
            setTimeout(() => {
                // destroy is not ne
                if(this._return().req?.end !== undefined) {
                    // destroy request, error | close event should be emitted automatically
                    this._return().req?.destroy()
                }
                
            }, this.options.timeout)
        }

        this._return().req?.on('error', error => {
            const error_result = { ...result, error }
            if(requestCallback !== undefined)  requestCallback(error_result)
            
            this.error(error_result)  // error event listener exists
        })

        // has body
        if(this.options?.body !== undefined && /^post|put|delete$/i.test(this.options.method || 'GET')) {
            this._return().req?.write(this.options.body || {})    // append body
        }

        this._return().req?.end()    // req end
        

        // return PokeResult in callback
        if(this.callback !== undefined) {
            // fire request
            this.makeRequest(this.callback)
        }

        return this._return
    }
}





// function Poke<Body>(host:string, options?:PokeOption<Body>, callback?:(pr: PokeResult) => void):PokeReturn {
//     // the flag to indicate whether request is fired already
//     let requestFired = false

//     // set event manager
//     const  eventManager = initEventManager()

//     // declare PokeReturn
//     const _return:PokeReturn = {
//         promise: () => new Promise((resolve, reject) => {
//             // fire request
//             makeRequest(result => {
//                 // callback based on error whether error exists
//                 !isPokeError(result)? resolve(result): reject(result)
//             })
//         }),

//         abort: () => {
//             // ensure the destroy function is available
//             if(_return.req?.destroy !== undefined) {
//                 _return.req.destroy()
//             }
//         },
//         on: (eventName, callback) => {
//             // assign callback corresponse to event name
//             eventManager.set(eventName, callback)
//             return _return
//         },
//         // set write stream
//         pipe: (stream) => {
//             // listen to stream event
//             eventManager.stream(stream)
//             // fire request
//             makeRequest()
//             // return Write Stream
//             return stream
//         }
//     }

//     // handler
//     const makeRequest = function(requestCallback?:(pokeResult: PokeResult) => void) {
//         // if request is already fired, skip
//         if(requestFired === true) return
//         // noted that request is fired
//         requestFired = true
//         // get protocol
//         const protocol = host.substr(0, host.indexOf(':'))
//         // check protocol
//         if(!this.isProtocol(protocol)) {
//             throw new Error('url must starts with http:// or https://')
//         }

        

//         // get hostname
//         let hostname:string = host.split('://').pop() || ''
//         // make sure hostname is valid
//         if(hostname === undefined || hostname === null || hostname.length === 0) {
//             throw new Error('hostname is required to poke request.')
//         }
//         // let's breakdown the full url into domain and path
//         const full_url:Array<string> = hostname?.split('/') || []
//         // get hostname by removing the first element
//         hostname = full_url.shift() || ''
//         // get path from options.path, join the rest elements if options.path does not exist
//         let path = options?.path || full_url.join('/')
//         // append querys
//         path = `/${path}${Object.keys(options?.query || {}).length > 0 ? stringifyQuery(options?.query || {}) : ''}`
//         // determine which http library we should use
//         const _http = {
//             http,
//             https, 
//         }[protocol]

//         // setup result container
//         const result:PokeSuccess = {
//             body: '',
//             // parse json function
//             json: <Result>(jsonCallback?: JSONCallback<Result>) => jsonCallback
//                 ? toJsonWithCallback<Result>(result.body, jsonCallback)
//                 : toJson<Result>(result.body)
//         }
//         // setup request payload
//         const payload = {
//             method : options?.method?.toUpperCase() || 'GET',
//             protocol : `${protocol}:`,
//             hostname,
//             path,
//             port : options?.port || (/^https$/.test(protocol) ? 443 : 80),
//             headers : options?.headers || {}
//         }

//         // need to handle basic auth
//         if(options?.username !== undefined || options?.password !== undefined) {
//             payload.headers = {
//                 ...payload.headers,
//                 Authorization : `Basic ${Buffer.from(`${options?.username || ''}:${options?.password || ''}`).toString('base64')}`
//             }
//         }
//         // prepare request and save it to pokeReturn
//         _return.req = _http.request(payload, res => {
//             // set status code
//             result.statusCode = res.statusCode
//             // does response header indicates that using gzip?
//             const isGzip = /^gzip$/.test((res.headers || {})['content-encoding'] || '')

//             const prepareStream = (stream: http.IncomingMessage | zlib.Gunzip) => stream
//                 // data listener
//                 .on('data', d => {
//                     // decompression chunk ready, add it to the buffer
//                     result.body = result.body.concat(Buffer.isBuffer(d) ? d.toString() : d)
//                     // data event listener exists
//                     eventManager.data(d)
//                 })

//                 // completion listner
//                 .on('end', () => {
                    
//                     result.headers = res.headers    // save headers
                   
//                     eventManager.end()   // end event listener exists
//                     // emit respnse
//                     eventManager.response(result)
//                     // callback with result
//                     if(requestCallback !== undefined) {
//                         requestCallback(result)
//                     }
//                 })
//                 // error listener
//                 .on('error', error => {
//                     const error_result = { ...result, error }
//                     // end event listener exists
//                     eventManager.end()
//                     // error event listener exists
//                     eventManager.error(error_result)
//                     // reject
//                     if(requestCallback !== undefined) {
//                         requestCallback(error_result)
//                     }
//                 })
//             // is gzip, decompress gzip response first if yes
//             if((options?.gzip !== undefined && options?.gzip === true) || isGzip === true) {
//                 // get gzip
//                 const gunzip = zlib.createGunzip()
//                 // pipe response to decompress
//                 res.pipe(gunzip)
//                 // handles data
//                 prepareStream(gunzip)
//             }
//             // handles non-gzip compressed request
//             else {
//                 prepareStream(res)
//             }
//         })
//         // timeout option is valid and response does not yet to come
//         if(options?.timeout !== undefined && !isNaN(options?.timeout) && options?.timeout > 0 && result.statusCode === undefined) {
//             // setup timeout function
//             setTimeout(() => {
//                 // destroy is not ne
//                 if(_return.req?.end !== undefined) {
//                     // destroy request, error | close event should be emitted automatically
//                     _return.req.destroy()
//                 }
//             }, options.timeout)
//         }


//         // error listener
//         _return.req?.on('error', error => {
//             const error_result = { ...result, error }
//             // reject
//             // reject
//             if(requestCallback !== undefined) {
//                 requestCallback(error_result)
//             }
//             // error event listener exists
//             eventManager.error(error_result)
//         })
//         // has body
//         if(options?.body !== undefined && /^post|put|delete$/i.test(options.method || 'GET')) {
//             // append body
//             _return.req?.write(options.body || {})
//         }
//         // req end
//         _return.req?.end()
//     }

//     // return PokeResult in callback
//     if(callback !== undefined) {
//         // fire request
//         makeRequest(callback)
//     }

//     return _return
// }

const init = new PokeClass('https://rapidapi.com', {}, (result) => {
    if(!result)console.log('error')

    return console.log(result.body)
})

console.log(init)




export default PokeClass;
