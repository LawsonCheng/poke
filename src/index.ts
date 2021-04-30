import * as https from 'https'
import * as http from 'http'
import PokeOption from './interfaces/PokeOption'
import PokeResult from './interfaces/PokeResult'
import { stringifyQuery } from './helpers/Query'
import { toJson } from './helpers/JSON'

function Poke (host:string, options?:PokeOption, callback?:Function):void|Promise<PokeResult> {
    // handler
    const makeRequest = function (resolve:Function, reject?:Function) {
        // get protocol
        const protocol = host.substr(0, host.indexOf(':'))
        // get hostname
        const hostname = host.split('://').pop()
        // check protocol
        if(!/^https?/.test(protocol)) {
            throw new Error('url must starts with http:// or https://')
        }
        // determine which http library we should use
        const _http = {
            http,
            https, 
        }[protocol]
        // setup result container
        let result:PokeResult = {}
        // setup request payload
        let payload = {
            method : options?.method?.toUpperCase() || 'GET',
            protocol : `${protocol}:`,
            hostname,
            port : options?.port || (/^https$/.test(protocol) ? 443 : 80),
            path : `${options?.path}${Object.keys(options?.query || {}).length > 0 ? stringifyQuery(options?.query || {}) : ''}`,
            headers : options?.headers || {}
        }
        // is promise flag
        const isPromise = reject !== undefined
        // prepare request
        const req = _http?.request(payload, res => {
            // set status code
            result.statusCode = res.statusCode
            // data listener
            res.on('data', d => {
                result.body = result.body || ''
                result.body += d
            })
            // completion listener
            res.on('end', () => {
                // append parse json function to result body
                result.json = (jsonCallback:(error:Error|null, json:any) => {}) => toJson((result.body || ""), jsonCallback)
                // callback with result
                resolve(result)
            })
            // error listener
            res.on('error', error => {
                // set error
                result.error = error
                // reject
                isPromise ? (reject && reject(result)) : resolve(result)
            })
        })
        // error listener
        req?.on('error', error => {
            // set error
            result.error = error
            // reject
            isPromise ? (reject && reject(result)) : resolve(result)
        })
        // has body
        if(options?.body !== undefined && /^post|put|delete$/i.test(options.method || 'GET')) {
            // append body
            req?.write(options.body || {})
        }
        // req end
        req?.end()
    }

    // return result in Promise
    if(callback === undefined) {
        return new Promise(makeRequest)
    } 
    // return in callback
    else {
        makeRequest(callback)
    }

}

export default Poke