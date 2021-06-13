import PokeOption from './interfaces/PokeOption';
import PokeReturn from './interfaces/PokeReturn';
declare function Poke(host: string, options?: PokeOption, callback?: (PokeResult: any) => void): PokeReturn;
export default Poke;
