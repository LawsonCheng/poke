import { WriteStream } from 'fs'
import { ServerResponse } from 'http'
import { PokeError, PokeSuccess } from '../interfaces/PokeResult'

type CallbackEvent = 'data' | 'error' | 'response' | 'end'

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

interface EventManager {
    set: <Event extends CallbackEvent>(eventName: Event, callback: EventCallbacksContainer[Event]) => void,
    response: EventCallbacksContainer['response'],
    end: EventCallbacksContainer['end'],
    error: EventCallbacksContainer['error'],
    data: EventCallbacksContainer['data'],
    stream: {
        set: (writableStream: Stream) => void,
        write: (chunk:unknown) => void, // FIXME what is the type of chuck should be string?
        end: () => void,
    }
}

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
        },
        stream: {
            set: (writableStream) => {
                // save stream
                callbacks['stream'] = writableStream
            },
            write: (d) => {
                // ensure stream exists
                if(callbacks['stream'] !== undefined) {
                    // emit stream end event
                    callbacks['stream'].write(d)
                }
            },
            end: () => {
                // ensure stream exists
                if(callbacks['stream'] !== undefined) {
                    // emit stream end event
                    callbacks['stream'].end()
                }
            }
        }
    }
}

export default initEventManager
