import PokeOption from './interfaces/PokeOption';
import PokeReturn from './interfaces/PokeReturn';
import PokeResult from './interfaces/PokeResult';
/**
 * Usage: https://github.com/LawsonCheng/poke/blob/main/README.md
 *
 * @param host:string The destination of your request pointing to.
 * @param options Specify your method, body, headers etc to customize your request
 * @param callback Callback(result:PokeResult) will be called when the request is completed
 *
 * @returns Promise<PokeResult> | .on('response'|'end'|'data'|'error', callback(result:any)) | pipe(stream:WriteStream)
 */
declare function Poke<Body>(host: string, options?: PokeOption<Body>, callback?: (pr: PokeResult) => void): PokeReturn;
export default Poke;
