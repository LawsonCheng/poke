import { IncomingHttpHeaders } from 'http'

export interface JSONCallback {
    (error:Error|null, json:{[propName:string]:any}|null): unknown
}

export default interface PokeResult {
    statusCode? : number
    error? : Error
    body? : string
    headers? : Headers|IncomingHttpHeaders
    json? : (jsonCallback?:JSONCallback) => void|Promise<unknown>
}