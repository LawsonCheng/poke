import { IncomingHttpHeaders } from 'http'

export interface JSONCallback<Result> {
    (error:Error | null, json: Result | null): unknown
}

export interface PokeSuccess<Result> {
    statusCode? : number
    body : string
    headers? : Headers|IncomingHttpHeaders
    json : (jsonCallback?:JSONCallback<Result>) => void | Promise<Result>
}

export type PokeError<Result> = PokeSuccess<Result> & {
    error : Error
}

export type PokeResult<Result> = PokeSuccess<Result> | PokeError<Result>

export function isPokeSuccess<Result>(input) : input is PokeSuccess<Result>{
    return input.error == undefined
}

export function isPokeError<Result>(input) : input is PokeError<Result>{
    return input.error != undefined
}

export default PokeResult
