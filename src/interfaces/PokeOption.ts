export default interface PokeOption {
    method? : 'POST'|'GET'|'PUT'|'DELETE'|'PATCH'|'OPTIONS'|'HEAD'|'CONNECT'|'TRACE',
    path? : string
    port? : number
    headers? : Headers
    query? : {[key:string]:number|boolean|string|null}
    body? : unknown
    gzip? : boolean
    // for the convinience of Basic auth
    username? : string
    password? : string
}