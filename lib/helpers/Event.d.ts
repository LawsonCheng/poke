/// <reference types="node" />
import { WriteStream } from 'fs';
import { ServerResponse } from 'http';
import PokeResult, { PokeError, PokeSuccess } from '../interfaces/PokeResult';
/**
 * Defines protocol js.Poke supports
 */
declare type Protocol = 'http' | 'https';
/**
 * Callback event name
 */
declare type CallbackEvent = 'data' | 'error' | 'response' | 'end';
/**
 * Defines types of stream
 */
declare type Stream = WriteStream | ServerResponse;
/**
 * Defines container for different callbacks
 */
declare type EventCallbacksContainer = {
    [e in CallbackEvent | 'stream']?: e extends 'data' ? (chunk: string) => void : e extends 'error' ? (result: PokeError) => void : e extends 'response' ? (param?: PokeSuccess) => void : e extends 'end' ? () => void : e extends 'stream' ? Stream : never;
};
export declare class EventManagerClass {
    callbacks: EventCallbacksContainer;
    isPokeError: (input: PokeError) => void;
    constructor();
    isProtocol: (input: string) => input is Protocol;
    isCallbackEvent(input: string): input is CallbackEvent;
    set(eventName: string, callback: () => void): void;
    response(result: PokeResult): void;
    end(): void;
    error(result: PokeError): void;
    data(chunk: string): void;
    stream(writableStream: Stream): void;
}
export {};
