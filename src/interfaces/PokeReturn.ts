import PokeResult from './PokeResult'
import * as http from 'http'

export default interface PokeReturn {
    req: http.ClientRequest|undefined,
    promise : () => Promise<PokeResult>,
    // abort request
    abort : () => void,
    // event listeners
    on: (eventName:'data'|'error'|'response', callback:(result:any) => void) => void,
    /* ----- stream ----- */
    pipe: (chunck:string) => void,
}