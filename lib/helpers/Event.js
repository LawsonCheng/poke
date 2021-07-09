"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isCallbackEvent(input) {
    return /^data|error|response|end$/.test(input);
}
const initEventManager = function () {
    // the place to stores those callbacks
    const callbacks = {};
    // return append callback methods and event callback methods
    return {
        // set 
        set: (eventName, callback) => {
            // valid event name and callback is a function
            if (isCallbackEvent(eventName)) {
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
                if (callbacks['stream'] !== undefined) {
                    // emit stream end event
                    callbacks['stream'].write(d);
                }
            },
            end: () => {
                // ensure stream exists
                if (callbacks['stream'] !== undefined) {
                    // emit stream end event
                    callbacks['stream'].end();
                }
            }
        }
    };
};
exports.default = initEventManager;
