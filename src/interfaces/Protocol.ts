type Protocol = 'http' | 'https';

export function isProtocol(input: string): input is Protocol {
    return /^https?/.test(input)
}
