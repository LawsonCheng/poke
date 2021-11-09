/// <reference types="node" />
import * as http from 'http';
import { WriteStream } from 'fs';
import { ServerResponse } from 'http';
import PokeOption from './interfaces/PokeOption';
import PokeResult, { PokeSuccess } from './interfaces/PokeResult';
import { EventManagerClass } from './helpers/Event';
/**
 * Usage: https://github.com/LawsonCheng/poke/blob/main/README.md
 *
 * @param host:string The destination of your request pointing to.
 * @param options Specify your method, body, headers etc to customize your request
 * @param callback Callback(result:PokeResult) will be called when the request is completed
 * @returns Promise<PokeResult> | .on('response'|'end'|'data'|'error', callback(result:any)) | pipe(stream:WriteStream)
 */
export declare class PokeClass extends EventManagerClass {
    host: string;
    options?: PokeOption<Body>;
    callback?: (pr: PokeResult) => void;
    requestFired: boolean;
    req?: http.ClientRequest;
    constructor(host: string, options?: PokeOption<Body>, callback?: (pr: PokeResult) => void);
    private prepareStream;
    private makeRequest;
    promise: () => Promise<PokeSuccess>;
    abort: () => void;
    on: (eventName: string, callback: () => void) => this;
    pipe: (stream: any) => WriteStream | ServerResponse;
}
declare const Poke: (host: string, options?: PokeOption<Body> | undefined, callback?: ((pr: PokeResult) => void) | undefined) => PokeClass;
export default Poke;
