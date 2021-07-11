/// <reference types="node" />
import { WriteStream } from 'fs';
import { ServerResponse } from 'http';
import { PokeError, PokeSuccess } from '../interfaces/PokeResult';
declare type CallbackEvent = 'data' | 'error' | 'response' | 'end';
declare type Stream = WriteStream | ServerResponse;
declare type EventCallbacksContainer<Result> = {
    [e in CallbackEvent | 'stream']?: e extends 'data' ? (chunk: string) => void : e extends 'error' ? (result: PokeError<Result>) => void : e extends 'response' ? (param?: PokeSuccess<Result>) => void : e extends 'end' ? () => void : e extends 'stream' ? Stream : never;
};
interface EventManager<Result> {
    set: <Event extends CallbackEvent>(eventName: Event, callback: EventCallbacksContainer<Result>[Event]) => void;
    response: EventCallbacksContainer<Result>['response'];
    end: EventCallbacksContainer<Result>['end'];
    error: EventCallbacksContainer<Result>['error'];
    data: EventCallbacksContainer<Result>['data'];
    stream: {
        set: (writableStream: Stream) => void;
        write: (chunk: unknown) => void;
        end: () => void;
    };
}
declare const initEventManager: <Result>() => EventManager<Result>;
export default initEventManager;
