import * as https from 'https'
import * as http from 'http'
import PokeOption from './interfaces/PokeOption'
import PokeResult, { JSONCallback } from './interfaces/PokeResult'
import { stringifyQuery } from './helpers/Query'
import { toJson } from './helpers/JSON'

function Poke (host:string, options?:PokeOption, callback?:(any)):void|Promise<PokeResult> {
    // handler
    const makeRequest = function (resolve:(any), reject?:(any)) {
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
                result.json = (jsonCallback?:JSONCallback) => toJson((result.body || ''), jsonCallback)
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