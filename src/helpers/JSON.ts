/**
 * JsonCallback should Result Or Error only
 */
export interface JSONCallback<Result> {
    (error:Error | null, json: Result | null): unknown
}

/**
 * 
 * @param jsonString
 * string to parse as json
 * 
 * @param callback
 * callback function to return parsed json
 */


export function toJsonWithCallback<Result>(jsonString:string, callback: JSONCallback<Result>): void {
    try {
        // parse json
        const json = JSON.parse(jsonString)
        // callback with error:null, result:json
        callback(null, json)
    } catch (error) {
        const _error = error as Error
        // callback with error:null, result:json
        callback(_error, null)
    }
}

/**
 * 
 * @param jsonString 
 * @returns Promise with json object parsed or Error object
 */
export function toJson<Result>(jsonString:string): Promise<Result>  {
    try {
        // parse json
        const json = JSON.parse(jsonString) as Result
        return Promise.resolve(json)    // resolve with json

    } catch (error) {
        return Promise.reject(error)    // error occurred, reject promise
    }
}
