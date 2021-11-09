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
export declare type CallbackEvent = 'data' | 'error' | 'response' | 'end';
/**
 * Defines types of stream
 */
declare type Stream = WriteStream | ServerResponse;
/**
 * Defines container for different callbacks
 */
declare type EventCallbacksContainer = {
    data?: (chunk: string | Buffer) => void;
    error?: (result: PokeError) => void;
    response?: (param?: PokeSuccess) => void;
    end?: () => void;
};
export declare type EventCallbackFunctions = EventCallbacksContainer[keyof EventCallbacksContainer];
export declare class EventManagerClass {
    protected callbacks: EventCallbacksContainer;
    protected isPokeError: (input: PokeError) => void;
    constructor();
    protected isProtocol: (input: string) => input is Protocol;
    protected isCallbackEvent(input: string): input is CallbackEvent;
    protected set(eventName: CallbackEvent, callback: any): void;
    protected response(result: PokeResult): void;
    protected end(): void;
    protected error(result: PokeError): void;
    protected data(chunk: string): void;
    protected stream(writableStream: Stream): void;
}
export {};
