/// <reference types="node" />
import { WriteStream } from 'fs';
import { ServerResponse } from 'http';
import { PokeError, PokeSuccess } from '../interfaces/PokeResult';
interface EventManager<Result> {
    set: (eventName: string, callback: (param?: unknown) => void) => void;
    response: (result: PokeSuccess<Result>) => void;
    end: () => void;
    error: (result: PokeError<Result>) => void;
    data: (chunk: string | unknown) => void;
    stream: {
        set: (writableStream: WriteStream | ServerResponse) => void;
        write: (chunk: string | unknown) => void;
        end: () => void;
    };
}
declare const Event: <Result>() => EventManager<Result>;
export default Event;
