import { JSONCallback } from '../interfaces/PokeResult';
export declare function toJson<Result>(jsonString: string): Promise<Result>;
export declare function toJson<Result>(jsonString: string, callback: JSONCallback<Result>): void;
