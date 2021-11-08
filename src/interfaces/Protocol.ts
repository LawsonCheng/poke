/* eslint-disable linebreak-style */
type Protocol = 'http' | 'https';

/**
 * 
 * @param input:string The prefix of the protocol
 * Determines whether the protocol is valid
 * 
 * @returns Boolean
 */


export function isProtocol(input: string): input is Protocol {
    return /^https?/.test(input)
}
