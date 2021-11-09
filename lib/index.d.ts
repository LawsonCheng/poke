/// <reference types="node" />
import * as http from 'http';
import * as zlib from 'zlib';
import { WriteStream } from 'fs';
import { ServerResponse } from 'http';
import PokeOption from './interfaces/PokeOption';
import PokeResult, { PokeSuccess } from './interfaces/PokeResult';
import { EventManagerClass } from './helpers/Event';
/**
 * Class of "Poke"
 */
export declare class PokeClass extends EventManagerClass {
    host: string;
    options?: PokeOption<Body>;
    protected callback?: (pr: PokeResult) => void;
    protected requestFired: boolean;
    protected req?: http.ClientRequest;
    /**
     * Constructor
     * @param host required. https://foo.com/api
     * @param options optional
     * @param callback optional
     */
    constructor(host: string, options?: PokeOption<Body>, callback?: (pr: PokeResult) => void);
    /**
     * @private Handling stream response
     * @param stream:pipe
     * @returns http.Incomingmessage|zlib.Gunzip
     */
    protected prepareStream: (stream: http.IncomingMessage | zlib.Gunzip) => http.IncomingMessage | zlib.Gunzip;
    /**
     * @private Main body to hanlding the request
     * @param requestCallback:
     * @returns
     */
    protected makeRequest(requestCallback?: (pokeResult: PokeResult) => void): this | void;
    /**
     * Returns the request in the form of Promise()
     * @returns Promise<PokeSuccess>
     */
    promise: () => Promise<PokeSuccess>;
    /**
     * Terminate request if it's not completed yet
     */
    abort: () => void;
    /**
     * Listening to various of events of the request
     * @param eventName
     * @param callback
     * @returns
     */
    on: (eventName: string, callback: () => void) => this;
    /**
     * Pipe response
     * @param stream
     * @returns
     */
    pipe: (stream: any) => WriteStream | ServerResponse;
}
/**
 * Usage: https://github.com/LawsonCheng/poke/blob/main/README.md
 *
 * @param host:string The destination of your request pointing to.
 * @param options Specify your method, body, headers etc to customize your request
 * @param callback Callback(result:PokeResult) will be called when the request is completed
 * @returns Promise<PokeResult> | .on('response'|'end'|'data'|'error', callback(result:any)) | pipe(stream:WriteStream)
 */
declare const Poke: (host: string, options?: PokeOption<Body> | undefined, callback?: ((pr: PokeResult) => void) | undefined) => PokeClass;
export default Poke;
