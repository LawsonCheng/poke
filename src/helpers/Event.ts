import { WriteStream } from 'fs'
import { ServerResponse } from 'http'
import { PokeError, PokeSuccess } from '../interfaces/PokeResult'


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

/**
 * Initiate and return an EventManager
 * @returns EventManager
 */
const initEventManager = function (): EventManager {
    // the place to stores those callbacks
    const callbacks: EventCallbacksContainer = {}
    // return append callback methods and event callback methods
    return {
        // set 
        set: (eventName, callback) => {
            // valid event name and callback is a function
            if(isCallbackEvent(eventName)) {
                // assign listener to listeners container
                callbacks[eventName] = callback
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
