/// <reference types="node" />
import { WriteStream } from 'node:fs';
import PokeResult from '../interfaces/PokeResult';
interface EventManager {
    set: (eventName: string, callback: (param?: unknown) => void) => void;
    response: (result: PokeResult) => void;
    end: () => void;
    error: (result: PokeResult) => void;
    data: (chunk: string | unknown) => void;
    stream: {
        set: (writableStream: WriteStream) => void;
        write: (chunk: string | unknown) => void;
        end: () => void;
    };
}
declare const Event: () => EventManager;
export default Event;
