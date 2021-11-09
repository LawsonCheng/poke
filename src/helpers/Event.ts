import { WriteStream } from 'fs'
import { ServerResponse } from 'http'
import PokeResult, { PokeError, PokeSuccess } from '../interfaces/PokeResult'

/**
 * Defines protocol js.Poke supports
 */
type Protocol = 'http'|'https';

/**
 * Callback event name
 */
type CallbackEvent = 'data' | 'error' | 'response' | 'end'

/**
 * Defines types of stream
 */
type Stream = WriteStream|ServerResponse

/**
 * Defines container for different callbacks
 */
type EventCallbacksContainer = {
    [e in CallbackEvent | 'stream']? : 
        e extends 'data' ? (chunk:string) => void : 
        e extends 'error' ? (result:PokeError) => void :
        e extends 'response' ? (param?:PokeSuccess) => void : 
        e extends 'end' ? () => void : 
        e extends 'stream' ? Stream : never
}

export class EventManagerClass {
    // callbacks container
    protected callbacks: EventCallbacksContainer;
    // check whether the PokeResult is PokeSuccess or PokeError
    protected isPokeError: (input:PokeError) => void;  

    constructor(){
        this.callbacks = {}
        this.isPokeError = (input: PokeError) => {
            return input.error != undefined
        }
    }

    protected isProtocol = (input: string) : input is Protocol => {
        return /^https?/.test(input)
    }

    protected isCallbackEvent(input:string): input is CallbackEvent {
        return /^data|error|response|end$/.test(input)
    }

    protected set(eventName:string, callback: () => void): void {
        if(this.isCallbackEvent(eventName)){
            this.callbacks[eventName] = callback
        }
    }

    protected response(result: PokeResult):void {
        if(this.callbacks['response'] != undefined){
            this.callbacks['response'](result)
        }
    }

    protected end():void {
        if(this.callbacks['end'] != undefined) {
            this.callbacks['end']()
        }
        if(this.callbacks['stream'] != undefined){
            this.callbacks['stream'].end()
        }
    }

    protected error (result: PokeError):void {
        if(this.callbacks['error'] !== undefined) {
            // return response object with error
            this.callbacks['error'](result)
        }
    }

    protected data (chunk: string): void {
        if(this.callbacks['data'] !== undefined) {
            this.callbacks['data'](chunk)
        }
        // ensure stream exists
        if(this.callbacks['stream'] !== undefined) {
            // emit stream end event
            this.callbacks['stream'].write(chunk)
        }
    }

    protected stream(writableStream: Stream):void {
        // save stream
        this.callbacks['stream'] = writableStream   
    }
}
