/**
 * A simple helper to transform the Object to a query string
 * @param query:Object
 * @returns string
 */
export function stringifyQuery(query:{ [key:string] : number|boolean|string|null }):string {
    // compose query
    const queries = Object.keys(query)
        .reduce<string[]>((queryStrings, key) => {
            queryStrings.push(`${key}=${query[key]}`)   // append query pairs
            return queryStrings
        }, [])
    // return queries join by '&'
    return `?${queries.join('&')}`
}