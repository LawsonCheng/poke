"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyQuery = void 0;
/**
 * A simple helper to transform the Object to a query string
 * @param query:Object
 * @returns string
 */
function stringifyQuery(query) {
    // compose query
    const queries = Object.keys(query)
        .reduce((queryStrings, key) => {
        queryStrings.push(`${key}=${query[key]}`); // append query pairs
        return queryStrings;
    }, []);
    // return queries join by '&'
    return `?${queries.join('&')}`;
}
exports.stringifyQuery = stringifyQuery;
