export default interface PokeOption {
    method? : 'CREATE'|'GET'|'PUT'|'DELETE'|'PATCH'|'OPTIONS'|'HEAD'|'CONNECT'|'TRACE',
    path? : string
    port? : number
    headers? : Headers
    query? : {[key:string]:number|boolean|string|null}
    body? : unknown
    // for the convinience of Basic auth
    username? : string
    password? : string
}