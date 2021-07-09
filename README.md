# Poke
A lightweight and handy JS HTTP Client.

[![npm package](https://nodei.co/npm/js.poke.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/js.poke/)

[![Build-status](https://github.com/LawsonCheng/poke/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/LawsonCheng/poke/actions/workflows/build.yml/badge.svg)
[![Tests](https://github.com/LawsonCheng/poke/actions/workflows/jest.yml/badge.svg?branch=main)](https://github.com/LawsonCheng/poke/actions/workflows/jest.yml/badge.svg)
[![esLint](https://github.com/LawsonCheng/poke/actions/workflows/eslint.yml/badge.svg?branch=main)](https://github.com/LawsonCheng/poke/actions/workflows/eslint.yml/badge.svg)
[![Dependency Status](https://img.shields.io/david/LawsonCheng/poke.svg?style=flat-square)](https://david-dm.org/LawsonCheng/poke)
[![Known Vulnerabilities](https://snyk.io/test/npm/js.poke/badge.svg?style=flat-square)](https://snyk.io/test/npm/js.poke)

## Why use Poke?

- [x] Very easy to use
- [x] Written in Typeescript
- [x] Lightweight
- [x] Stream support
- [ ] WebSocket (Upcoming)

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
poke( 'https://foo.api.com/candys')
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

Poke accepts `hostname`, `pokeOptions` and the callback function as the inputs.
then it returns some methods for you to apply in different scenarios.
Omit the callback function if you would like to handle the result with `Promise`.


### promise
```js
const poke = require('js.poke')

// Using promise
poke(hostname , pokeOptions)
.promise()
.then(result => { 
    // do your handling here
    ... 
})
.catch(error => {
    // handle error
    ...
})
```


### callback
```js
const poke = require('js.poke')
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


### Form Data
```js
poke(
    'https://httpbin.org/post',
    {
        method : 'POST',
        // Specify your form data with `boby`
        body : JSON.stringify({
            name : 'kfhk!sdkm!'
        })
    }
)
// ...
```

### Listening to events by using `on`
```js
const poke = require('js.poke')
// Using callback
poke(hostname , pokeOptions)
// listen to response retrived
.on('response', result => {
    console.log(result)
})
// on chunk is recieved
.on('data', (chunk) => {
    // handle your data here
    console.log(d)
})
// on request eneded
.on('end', () => {
    console.log('Request is finished')
})
// listening to error
.on('error', (result) => {
    // handle error
    console.log(result.error)
})
```

### Stream

```js
const fs = require('fs')
const poke = require('js.poke')

// get image
poke('https://via.placeholder.com/100x100')
// write data as an image file
.pipe(fs.createWriteStream('image.png'))
```

Even we can using Poke as a proxy!
```js
const poke = require('js.poke')

const serv = http.createServer((req, res) => {
    if (req.url === '/placeholder') {
        // get image or whatever you want
        poke('https://via.placeholder.com/100x100')
        // pipe response to res
        .pipe(res)
    } else {
        res.end('Bye!')
    }
})
serv.listen(4321)
```


### The Poke Options
The `pokeOptions` allows you to customize your request.

```js
// The poke option
const options = {
    // POST, PUT, DELETE
    method : "GET", 
    path : "/", 
    port : 3001,
    // will set automatically, you may override the auto-detect value by specify this boolean
    gzip : true, 
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