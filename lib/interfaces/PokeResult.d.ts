/// <reference types="node" />
import { IncomingHttpHeaders } from 'http';
import { JSONCallback } from '../helpers/JSON';
/**
 * PokeSuccess is returned when the request is succeeded.
 * @property statusCode:number
 * @property body:string
 * @property headers:Headers|IncomingHttpHeaders
 * @property json(jsonCallback:(JSON)) => void|Promise
 */
export interface PokeSuccess {
    statusCode?: number;
    body: string;
    headers?: Headers | IncomingHttpHeaders;
    json: <Result>(jsonCallback?: JSONCallback<Result>) => void | Promise<Result>;
}
/**
 * PokeError is returned when the request is failed.
 * It contains an `Error` object.
 */
export declare type PokeError = PokeSuccess & {
    error: Error;
};
/**
 * PokeResult consist of PokeSuccess or PokeError
 */
export declare type PokeResult = PokeSuccess | PokeError;
/**
 * Determines the result is PokeError or not
 * @param input:PokeError|PokeSuccess
 * @returns Boolean
 */
export declare function isPokeError(input: PokeError | PokeSuccess): input is PokeError;
export default PokeResult;
