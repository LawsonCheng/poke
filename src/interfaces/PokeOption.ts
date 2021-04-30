export default interface PokeOption {
    method? : string
    path? : string
    port? : number
    headers? : Headers
    query? : {[key:string]:number|boolean|string|null}
    body? : any
    // for the convinience of Basic auth
    username? : string
    password? : string
}