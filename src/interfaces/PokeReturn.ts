import PokeResult from './PokeResult'
import * as http from 'http'
import { WriteStream } from 'fs'
import { ServerResponse } from 'http'


export default interface PokeReturn {
    req?: http.ClientRequest,
    promise : () => Promise<PokeResult>,
    // abort request
    abort : () => void,
    // event listeners
    on: (eventName:'data'|'error'|'response'|'end', callback:(result?:any) => void) => PokeReturn,
    /* ----- stream ----- */
    pipe: (writableStream:WriteStream|ServerResponse) => void,
}