import { WriteStream } from 'fs'
import { ServerResponse } from 'http'
import PokeResult, { PokeError, PokeSuccess } from '../interfaces/PokeResult'


type Protocol = 'http' | 'https';


/**
 * Callback event name
 */
type CallbackEvent = 'data' | 'error' | 'response' | 'end'

/**
 * 
 * Determines whether the event name is a valid callback event
 * @param input:string
 * @returns boolean
 */


function isCallbackEvent(input:string): input is CallbackEvent {
    return /^data|error|response|end$/.test(input)
}


type Stream = WriteStream | ServerResponse

type EventCallbacksContainer = {
    [e in CallbackEvent | 'stream']? : 
        e extends 'data' ? (chunk:string) => void : 
        e extends 'error' ? (result:PokeError) => void :
        e extends 'response' ? (param?:PokeSuccess) => void : 
        e extends 'end' ? () => void : 
        e extends 'stream' ? Stream : never
}

/**
 * EventManager
 * Stores method that handles difference events
 */


interface EventManager {
    set: <Event extends CallbackEvent>(eventName: Event, callback: EventCallbacksContainer[Event]) => void,
    response: NonNullable<EventCallbacksContainer['response']>,
    end: NonNullable<EventCallbacksContainer['end']>,
    error: NonNullable<EventCallbacksContainer['error']>,
    data: NonNullable<EventCallbacksContainer['data']>,
    stream: (writableStream: Stream) => void
}

export class EventManagerClass {
    callbacks: EventCallbacksContainer; 
    isPokeError: (input:PokeError) => void;  
    // isProtocol: (input: Protocol) => void; 

    constructor(){
        this.callbacks = {}
        this.isPokeError = (input: PokeError) => {
            return input.error != undefined
        }
    }

    isProtocol =  (input: string) : input is Protocol => {
        return /^https?/.test(input)
    }

    isCallbackEvent(input:string): input is CallbackEvent {
        return /^data|error|response|end$/.test(input)
    }

    set(eventName:string, callback: () => void): void {
        if(this.isCallbackEvent(eventName)){
            this.callbacks[eventName] = callback
        }
    }

    response(result: PokeResult):void {
        if(this.callbacks['response'] != undefined){
            this.callbacks['response'](result)
        }
    }

    end(): void {
        if(this.callbacks['end'] != undefined) {
            this.callbacks['end']()
        }

        if(this.callbacks['stream'] != undefined){
            this.callbacks['stream'].end()
        }
    }

    error (result: PokeError):void {
        if(this.callbacks['error'] !== undefined) {
            // return response object with error
            this.callbacks['error'](result)
        }
    }

    data (chunk: string): void {
        if(this.callbacks['data'] !== undefined) {
            this.callbacks['data'](chunk)
        }
        // ensure stream exists
        if(this.callbacks['stream'] !== undefined) {
            // emit stream end event
            this.callbacks['stream'].write(chunk)
        }
    }

    stream(writableStream: Stream):void {
        this.callbacks['stream'] = writableStream   // save stream
    }
}


/**
 * Initiate and return an EventManager
 * @returns EventManager
 */

const initEventManager = function (): EventManager {
    // the place to stores those callbacks
    const callbacks: EventCallbacksContainer = {}   // return append callback methods and event callback methods
    return {
        // set 
        set: (eventName, callback) => {
            // valid event name and callback is a function
            if(isCallbackEvent(eventName)) {
                callbacks[eventName] = callback // assign listener to listeners container
            }
        },


        response: (result) => {
            if(callbacks['response'] !== undefined) {
                // return response
                callbacks['response'](result)
            }
        },
        end: () => {
            if(callbacks['end'] !== undefined) {
                // emit end event
                callbacks['end']()
            }
            // ensure stream exists
            if(callbacks['stream'] !== undefined) {
                // emit stream end event
                callbacks['stream'].end()
            }
        },
        error: (result) => {
            if(callbacks['error'] !== undefined) {
                // return response object with error
                callbacks['error'](result)
            }
        },


        data: (chunk) => {
            if(callbacks['data'] !== undefined) {
                callbacks['data'](chunk)
            }
            // ensure stream exists
            if(callbacks['stream'] !== undefined) {
                // emit stream end event
                callbacks['stream'].write(chunk)
            }
        },
        stream: (writableStream) => {
            // save stream
            callbacks['stream'] = writableStream
        }
    }
}

export default initEventManager
