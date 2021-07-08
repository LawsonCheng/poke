"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event = function () {
    // the place to stores those callbacks
    const callbacks = {};
    // return append callback methods and event callback methods
    const manager = {
        // set 
        set: (eventName, callback) => {
            // valid event name and callback is a function
            if (/^data|error|response|end$/.test(eventName) && /^function$/.test(typeof callback)) {
                // assign listener to listeners container
                callbacks[eventName] = callback;
            }
        },
        response: (result) => {
            if (callbacks['response'] !== undefined) {
                // return response
                callbacks['response'](result);
            }
        },
        end: () => {
            if (callbacks['end'] !== undefined) {
                // emit end event
                callbacks['end']();
            }
        },
        error: (result) => {
            if (callbacks['error'] !== undefined) {
                // return response object with error
                callbacks['error'](result);
            }
        },
        data: (chunk) => {
            if (callbacks['data'] !== undefined) {
                callbacks['data'](chunk);
            }
        },
        stream: {
            set: (writableStream) => {
                // save stream
                callbacks['stream'] = writableStream;
            },
            write: (d) => {
                // ensure stream exists
                if (callbacks['stream'] !== undefined && /^function$/.test(typeof callbacks['stream'].write)) {
                    // emit stream end event
                    callbacks['stream'].write(d);
                }
            },
            end: () => {
                // ensure stream exists
                if (callbacks['stream'] !== undefined && /^function$/.test(typeof callbacks['stream'].end)) {
                    // emit stream end event
                    callbacks['stream'].end();
                }
            }
        }
    };
    return manager;
};
exports.default = Event;
