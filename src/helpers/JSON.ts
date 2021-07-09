import { JSONCallback } from '../interfaces/PokeResult'

export function toJson <Result>(jsonString:string):Promise<Result>;
export function toJson <Result>(jsonString:string, callback:JSONCallback<Result>):void
export function toJson <Result>(jsonString:string, callback?:JSONCallback<Result>):void|Promise<Result> {
    if (callback === undefined) {
       try {
        // parse json
        const json = JSON.parse(jsonString)
        // resolve with json
        return Promise.resolve(json)
       } catch (error) {
           // error occurred, reject promise
           return Promise.reject(error)
       }
    } else {
        try {
            // parse json
            const json = JSON.parse(jsonString)
            // callback with error:null, result:json
            callback(null, json)
        } catch (error) {
            // callback with error:null, result:json
            callback(error, null)
        }
    }
}
