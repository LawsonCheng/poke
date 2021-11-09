export default interface PokeOption<Body> {
    /**
     * @description Standard http request methods
     */
    method? : 'POST'|'GET'|'PUT'|'DELETE'|'PATCH'|'OPTIONS'|'HEAD'|'CONNECT'|'TRACE',
    /**
     * @description The path of the requested url
     */
    path? : string
    /**
     * @description Port number of the requested url
     */
    port? : number
    /**
     * @description Put your customized headers here
     */
    headers? : Headers
    /**
     * @description Accepts Query object, the object will be parsed into query string
     */
    query? : {[key:string]:number|boolean|string|null}
    /**
     * @description Form Data/Request Body
     */
    body? : Body
    /**
     * @description Set true if use gzip, default false
     */
    gzip? : boolean
    /**
     * @description Terminate when the timeout value is reacted if the request is not finished yet. e.g. 1000 for 1s
     */
    timeout? : number,
    /**
     * @description The username of basic auth
     */
    username? : string
    /**
     * @description The password of basic auth
     */
    password? : string
}
