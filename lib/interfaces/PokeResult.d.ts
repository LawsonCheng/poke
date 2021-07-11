/// <reference types="node" />
import { IncomingHttpHeaders } from 'http';
export interface JSONCallback<Result> {
    (error: Error | null, json: Result | null): unknown;
}
export interface PokeSuccess<Result> {
    statusCode?: number;
    body: string;
    headers?: Headers | IncomingHttpHeaders;
    json: (jsonCallback?: JSONCallback<Result>) => void | Promise<Result>;
}
export declare type PokeError<Result> = PokeSuccess<Result> & {
    error: Error;
};
export declare type PokeResult<Result> = PokeSuccess<Result> | PokeError<Result>;
export declare function isPokeSuccess<Result>(input: any): input is PokeSuccess<Result>;
export declare function isPokeError<Result>(input: any): input is PokeError<Result>;
export default PokeResult;
