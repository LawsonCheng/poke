export function stringifyQuery(query:{ [key:string] : number|boolean|string|null }) {
    // compose query
    let queries = Object.keys(query)
                    .reduce<string[]>((queryStrings, key) => {
                        // append query pairs
                        queryStrings.push(`${key}=${query[key]}`)
                        return queryStrings
                    }, [])
    // return queries join by '&'
    return `?${encodeURIComponent(queries.join("&"))}`
}