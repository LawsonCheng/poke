/// <reference types="node" />
import { PokeSuccess } from './PokeResult';
import * as http from 'http';
import { WriteStream } from 'fs';
import { ServerResponse } from 'http';
export default interface PokeReturn {
    req?: http.ClientRequest;
    promise: () => Promise<PokeSuccess>;
    abort: () => void;
    on: (eventName: 'data' | 'error' | 'response' | 'end', callback: (result?: unknown) => void) => PokeReturn;
    pipe: (writableStream: WriteStream | ServerResponse) => void;
}
