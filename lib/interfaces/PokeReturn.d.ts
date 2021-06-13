import PokeResult from './PokeResult';
export default interface PokeReturn {
    promise: () => Promise<PokeResult>;
}
