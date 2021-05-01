# Poke
A lightweight and handy JS HTTP Client.

[![npm package](https://nodei.co/npm/@lawsoncheng/poke.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/@lawsoncheng/poke/)

[![Dependency Status](https://img.shields.io/david/LawsonCheng/poke.svg?style=flat-square)](https://david-dm.org/LawsonCheng/poke)
[![Known Vulnerabilities](https://snyk.io/test/npm/@lawsoncheng/poke/badge.svg?style=flat-square)](https://snyk.io/test/npm/@lawsoncheng/poke)

## Easy to use!
Poke is try to make http requests in the simplest way. See the following example:

```js
const poke = require('@lawsoncheng/poke')

// Using promise
poke( 'https://foo.api.com', { path : "/candys" })
.then(result => result.json())
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
const poke = require('@lawsoncheng/poke')

// Using promise
poke( hostname , pokeOptions )
.then(pokeResult => { 
    // do your handling here
    ... 
})
.catch(error => {
    // handle error
    ...
})

// Using promise
poke( hostname , pokeOptions )
.then(pokeResult => { 
    // do your handling here
    ... 
})
.catch(error => {
    // handle error
    ...
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
.then(result => {
    // status code
    console.log(result.statusCode)
    // body:string
    console.log(result.body)
    // parse json
    return result.json();
})
.then(json => {
    // handle with parsed json
    ...
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