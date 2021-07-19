/**
 * JsonCallback should Result Or Error only
 */
export interface JSONCallback<Result> {
    (error: Error | null, json: Result | null): unknown;
}
/**
 *
 * @param jsonString
 * string to parse as json
 *
 * @param callback
 * callback function to return parsed json
 */
export declare function toJsonWithCallback<Result>(jsonString: string, callback: JSONCallback<Result>): void;
/**
 *
 * @param jsonString
 * @returns Promise with json object parsed or Error object
 */
export declare function toJson<Result>(jsonString: string): Promise<Result>;
