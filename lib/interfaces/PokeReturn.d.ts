/// <reference types="node" />
import { PokeSuccess } from './PokeResult';
import * as http from 'http';
import { WriteStream } from 'fs';
import { ServerResponse } from 'http';
export default interface PokeReturn<Result> {
    req?: http.ClientRequest;
    promise: () => Promise<PokeSuccess<Result>>;
    abort: () => void;
    on: (eventName: 'data' | 'error' | 'response' | 'end', callback: (result?: any) => void) => PokeReturn<Result>;
    pipe: (writableStream: WriteStream | ServerResponse) => void;
}
