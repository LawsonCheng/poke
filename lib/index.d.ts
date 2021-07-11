import PokeOption from './interfaces/PokeOption';
import PokeReturn from './interfaces/PokeReturn';
import PokeResult from './interfaces/PokeResult';
declare function Poke<Body, Result>(host: string, options?: PokeOption<Body>, callback?: (pr: PokeResult<Result>) => void): PokeReturn<Result>;
export default Poke;
