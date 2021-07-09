import { PokeSuccess } from './PokeResult'
import * as http from 'http'
import { WriteStream } from 'fs'
import { ServerResponse } from 'http'


export default interface PokeReturn<Result> {
    req?: http.ClientRequest,
    promise : () => Promise<PokeSuccess<Result>>,
    // abort request
    abort : () => void,
    // event listeners
    on: (eventName:'data'|'error'|'response'|'end', callback:(result?:any) => void) => PokeReturn<Result>,
    /* ----- stream ----- */
    pipe: (writableStream:WriteStream|ServerResponse) => void,
}
