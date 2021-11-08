"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManagerClass = void 0;
class EventManagerClass {
    constructor() {
        this.isProtocol = (input) => {
            return /^https?/.test(input);
        };
        this.callbacks = {};
        this.isPokeError = (input) => {
            return input.error != undefined;
        };
    }
    isCallbackEvent(input) {
        return /^data|error|response|end$/.test(input);
    }
    set(eventName, callback) {
        if (this.isCallbackEvent(eventName)) {
            this.callbacks[eventName] = callback;
        }
    }
    response(result) {
        if (this.callbacks['response'] != undefined) {
            this.callbacks['response'](result);
        }
    }
    end() {
        if (this.callbacks['end'] != undefined) {
            this.callbacks['end']();
        }
        if (this.callbacks['stream'] != undefined) {
            this.callbacks['stream'].end();
        }
    }
    error(result) {
        if (this.callbacks['error'] !== undefined) {
            // return response object with error
            this.callbacks['error'](result);
        }
    }
    data(chunk) {
        if (this.callbacks['data'] !== undefined) {
            this.callbacks['data'](chunk);
        }
        // ensure stream exists
        if (this.callbacks['stream'] !== undefined) {
            // emit stream end event
            this.callbacks['stream'].write(chunk);
        }
    }
    stream(writableStream) {
        // save stream
        this.callbacks['stream'] = writableStream;
    }
}
exports.EventManagerClass = EventManagerClass;
