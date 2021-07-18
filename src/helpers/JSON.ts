export interface JSONCallback<Result> {
    (error:Error | null, json: Result | null): unknown
}

export function toJsonWithCallback<Result>(jsonString:string, callback: JSONCallback<Result>): void {
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

export function toJson<Result>(jsonString:string): Promise<Result>  {
    try {
        // parse json
        const json = JSON.parse(jsonString) as Result
        // resolve with json
        return Promise.resolve(json)
    } catch (error) {
        // error occurred, reject promise
        return Promise.reject(error)
    }
}
