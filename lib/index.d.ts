import PokeOption from './interfaces/PokeOption';
import PokeResult from './interfaces/PokeResult';
declare function Poke(host: string, options?: PokeOption, callback?: (any)): void | Promise<PokeResult>;
export default Poke;
