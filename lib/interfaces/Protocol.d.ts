declare type Protocol = 'http' | 'https';
/**
 *
 * @param input:string The prefix of the protocol
 * Determines whether the protocol is valid
 *
 * @returns Boolean
 */
export declare function isProtocol(input: string): input is Protocol;
export {};
