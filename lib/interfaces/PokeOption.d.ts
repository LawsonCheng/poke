export default interface PokeOption {
    method?: string;
    path?: string;
    port?: number;
    headers?: Headers;
    query?: {
        [key: string]: number | boolean | string | null;
    };
    body?: unknown;
    username?: string;
    password?: string;
}
