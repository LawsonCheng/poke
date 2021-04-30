export default interface PokeResult {
    statusCode?: number;
    raw?: any;
    error?: Error;
    body?: string;
    json?: Function;
}
