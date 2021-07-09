import { WriteStream } from 'fs'
import { ServerResponse } from 'http'
import { PokeError, PokeSuccess } from '../interfaces/PokeResult'

interface EventManager <Result>{
    set: (eventName:string, callback:(param?:unknown) => void) => void,
    response: (result:PokeSuccess<Result>) => void,
    end:() => void,
    error: (result:PokeError<Result>) => void,
    data: (chunk:string|unknown) => void,
    stream: {
        set: (writableStream:WriteStream|ServerResponse) => void,
        write: (chunk:string|unknown) => void,
        end: () => void,
    }
}

const initEventManager = function <Result>(): EventManager<Result> {
    // the place to stores those callbacks
    const callbacks = {}
    // return append callback methods and event callback methods
    return {
        // set 
        set: (eventName, callback) => {
            // valid event name and callback is a function
            if(/^data|error|response|end$/.test(eventName) && /^function$/.test(typeof callback)) {
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
        data: (chunk:string|unknown) => {
            if(callbacks['data'] !== undefined) {
                callbacks['data'](chunk)
            }
        },
        stream: {
            set: (writableStream:WriteStream|ServerResponse) => {
                // save stream
                callbacks['stream'] = writableStream
            },
            write: (d:string|unknown) => {
                // ensure stream exists
                if(callbacks['stream'] !== undefined && /^function$/.test(typeof callbacks['stream'].write)) {
                    // emit stream end event
                    callbacks['stream'].write(d)
                }
            },
            end: () => {
                // ensure stream exists
                if(callbacks['stream'] !== undefined && /^function$/.test(typeof callbacks['stream'].end)) {
                    // emit stream end event
                    callbacks['stream'].end()
                }
            }
        }
    }
}

export default initEventManager
