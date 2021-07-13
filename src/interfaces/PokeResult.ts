import { IncomingHttpHeaders } from 'http'
import { JSONCallback } from '../helpers/JSON'

export interface PokeSuccess {
    statusCode? : number
    body : string
    headers? : Headers|IncomingHttpHeaders
    json : <Result>(jsonCallback?:JSONCallback<Result>) => void | Promise<Result>
}

export type PokeError = PokeSuccess & {
    error : Error
}

export type PokeResult = PokeSuccess | PokeError

export function isPokeError(input) : input is PokeError{
    return input.error != undefined
}

export default PokeResult
