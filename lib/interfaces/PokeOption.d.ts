export default interface PokeOption {
    method?: string;
    path?: string;
    port?: number;
    headers?: Headers;
    query?: {
        [key: string]: number | boolean | string | null;
    };
    body?: any;
    username?: string;
    password?: string;
}
