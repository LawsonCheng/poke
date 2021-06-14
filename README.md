# Poke
A lightweight and handy JS HTTP Client.

[![npm package](https://nodei.co/npm/js.poke.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/js.poke/)

[![Dependency Status](https://img.shields.io/david/LawsonCheng/poke.svg?style=flat-square)](https://david-dm.org/LawsonCheng/poke)
[![Known Vulnerabilities](https://snyk.io/test/npm/js.poke/badge.svg?style=flat-square)](https://snyk.io/test/npm/js.poke)

## Installation
```sh
npm i js.poke --save
```
or
```sh
yarn js.poke
```

## Easy to use!
Poke allows you to make http request in the simplest way. See the following example:

```js
const poke = require('js.poke')

// Using promise
poke( 'https://foo.api.com', { path : "/candys" })
.promise()
.then(result => {
    // response body here
    console.log(result.body)
    // get result in json format
    return result.json()
})
.then(json => {
    // here is the json object
    console.log('> json: ', json)
})
.catch(err => {
    console.log('> Error: ', err)
})
```

## Usage
### How to use poke

Poke accepts three arguments, the `hostname`, `pokeOptions` and the callback function.
Omit the callback function if you would like to handle the result with `Promise`.

```js
const poke = require('js.poke')

// Using promise
poke( hostname , pokeOptions)
.promise()
.then(pokeResult => { 
    // do your handling here
    ... 
})
.catch(error => {
    // handle error
    ...
})

// Using callback
poke(hostname , pokeOptions, result => {
    // status code
    console.log(result.statusCode)
    // body
    console.log(result.body)
    // in json format
    result.json(json => {
        console.log(json)
    })
    // error
    console.log(result.error)
})
```

### The Poke Options
The `pokeOptions` allows you to customize your request.

```js
// The poke option
const options = {
    method : "GET", // POST, PUT, DELETE
    path : "/", 
    port : 3001,
    // username and password for Basic Auth
    username : 'foouser',
    password : 'foosecret'
    headers : {
        "content-type" : "application/json"
    },
    query : { page : 3 }
    body : JSON.stringify({
        first_name : "Poke",
        last_name : "You"
    })
}

poke('https://foo.api.com', options)
```

### The Poke result
The poke result contains the `body`, `statusCode` as well as the `error` object if the request is failed.
You may also call the `json()` to parse the body into json.

```js
poke('https://foo.api.com', options)
.promise()
.then(result => {
    // status code
    console.log(result.statusCode)
    // body:string
    console.log(result.body)
    // headers
    console.log(result.headers)
    // parse json
    return result.json()
})
.then(json => {
    // handle with parsed json
    console.log(json)
})
.catch(error => {
    // handler error
})
```

### Customize header
To customize the request header, add it into the options .

```js
poke('https://foo.api.com', {
    ...
    headers : {
        'content-type' : 'application/json',
        'authorization' : 'Bearer your_bearer_token'
    }
})
```


## Become a contirbutor!
Please see [CONTRIBUTING.md](https://github.com/LawsonCheng/poke/blob/main/CONTRIBUTING.md)