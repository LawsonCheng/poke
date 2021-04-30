import PokeOption from './interfaces/PokeOption';
import PokeResult from './interfaces/PokeResult';
declare function Poke(host: string, options?: PokeOption, callback?: Function): void | Promise<PokeResult>;
export default Poke;
