/**
 * A simple helper to transform the Object to a query string
 * @param query:Object
 * @returns string
 */
export declare function stringifyQuery(query: {
    [key: string]: number | boolean | string | null;
}): string;
