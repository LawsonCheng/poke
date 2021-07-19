/// <reference types="node" />
import { WriteStream } from 'fs';
import { ServerResponse } from 'http';
import { PokeError, PokeSuccess } from '../interfaces/PokeResult';
/**
 * Callback event name
 */
declare type CallbackEvent = 'data' | 'error' | 'response' | 'end';
declare type Stream = WriteStream | ServerResponse;
declare type EventCallbacksContainer = {
    [e in CallbackEvent | 'stream']?: e extends 'data' ? (chunk: string) => void : e extends 'error' ? (result: PokeError) => void : e extends 'response' ? (param?: PokeSuccess) => void : e extends 'end' ? () => void : e extends 'stream' ? Stream : never;
};
/**
 * EventManager
 * Stores method that handles difference events
 */
interface EventManager {
    set: <Event extends CallbackEvent>(eventName: Event, callback: EventCallbacksContainer[Event]) => void;
    response: NonNullable<EventCallbacksContainer['response']>;
    end: NonNullable<EventCallbacksContainer['end']>;
    error: NonNullable<EventCallbacksContainer['error']>;
    data: NonNullable<EventCallbacksContainer['data']>;
    stream: (writableStream: Stream) => void;
}
/**
 * Initiate and return an EventManager
 * @returns EventManager
 */
declare const initEventManager: () => EventManager;
export default initEventManager;
