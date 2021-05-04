"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyQuery = void 0;
function stringifyQuery(query) {
    // compose query
    const queries = Object.keys(query)
        .reduce((queryStrings, key) => {
        // append query pairs
        queryStrings.push(`${key}=${query[key]}`);
        return queryStrings;
    }, []);
    // return queries join by '&'
    return `?${encodeURIComponent(queries.join('&'))}`;
}
exports.stringifyQuery = stringifyQuery;
