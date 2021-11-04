/* eslint-disable linebreak-style */
import { PokeSuccess } from './PokeResult'
import * as http from 'http'
import { WriteStream } from 'fs'
import { ServerResponse } from 'http'


export default interface PokeReturn {
    req?: http.ClientRequest,
    promise : () => Promise<PokeSuccess>,
    // abort request
    abort : () => void,
    // event listeners
    on: (eventName:'data'|'error'|'response'|'end', callback:(result?:unknown) => void) => PokeReturn,
    /* ----- stream ----- */
    pipe: (writableStream:WriteStream|ServerResponse) => WriteStream|ServerResponse,
}
