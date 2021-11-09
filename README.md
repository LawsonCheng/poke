# Poke
A lightweight and handy JS HTTP Client.

[![npm package](https://nodei.co/npm/js.poke.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/js.poke/)

[![Build-status](https://github.com/LawsonCheng/poke/actions/workflows/build.yml/badge.svg)](https://github.com/LawsonCheng/poke/actions/workflows/build.yml/badge.svg)
[![Tests](https://github.com/LawsonCheng/poke/actions/workflows/jest.yml/badge.svg)](https://github.com/LawsonCheng/poke/actions/workflows/jest.yml/badge.svg)
[![esLint](https://github.com/LawsonCheng/poke/actions/workflows/eslint.yml/badge.svg)](https://github.com/LawsonCheng/poke/actions/workflows/eslint.yml/badge.svg)
[![Dependency Status](https://img.shields.io/david/LawsonCheng/poke.svg?style=flat-square)](https://david-dm.org/LawsonCheng/poke)
[![Known Vulnerabilities](https://snyk.io/test/npm/js.poke/badge.svg?style=flat-square)](https://snyk.io/test/npm/js.poke)

## Why use Poke?

- 😌 &nbsp;&nbsp;Very easy to use
- 👨🏻‍💻 &nbsp;&nbsp;Written in TypeScript
- 🚀 &nbsp;&nbsp;Lightweight
- ⼮ &nbsp;&nbsp;Stream support
- 💾 &nbsp;&nbsp;Easy to download file
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
    console.log(chunk)
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
    // in millisecond, if timeout is set and theer is no response return before timeout, request will abort
    timeout : 1000
    // username and password for Basic Auth
    username : 'foo_user',
    password : 'foo_secret'
    // customize your header here
    headers : {
        "content-type" : "application/json"
    },
    // will parse your query object to query string automatically
    query : { page : 3 }
    // form body
    body : JSON.stringify({
        first_name : "Poke",
        last_name : "You"
    })
}

poke('https://foo.api.com', options)
```

### PokeResult
The `PokeResult` is returned with one of the following types `PokeSuccess` and `PokeError`.
#### PokeSuccess
`PokeSuccess` contains the `req`, `body`, `statusCode`, `json()` and `headers`. call `json()` returns a promise and parse the body into json object.
#### PokeError
if the request is failed, `PokeError` contains `error`(type: `Error`) will be returned.


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
.catch(result => {
    // handler error
    console.log(result.error);
})
```

### Authentication
#### Basic-auth
Simply put your basic-auth's username and password in PokeOption.

```js
const options = {
    method : "GET", 
    // username and password for Basic Auth
    username : 'foo_user',
    password : 'foo_secret',
}

poke('https://foo.api.com', options)
.promise()
.then(result => result.json())
.then(json => console.log(result))
.catch(result => console.log(result.error))
```

#### Bearer auth
Put the bearer token into header for doing bearer authentication.


```js
const options = {
    method : "GET", 
    headers : {
        'authorization' : `Bearer ${your_bearer_token}`
    }
}

poke('https://foo.api.com', options)
.promise()
.then(result => result.json())
.then(json => console.log(result))
.catch(result => console.log(result.error))
```

### Customize header
Put custom headers attributes into `headers` of PokeOption.

```js
poke('https://foo.api.com', {
    ...
    headers : {
        // put your headers here....
        'content-type' : 'application/json',
    }
})
```

## Become a contirbutor!
Million thanks to whom contributes to this project!❤️
<br/>
<a href = "https://github.com/LawsonCheng/poke/contributors">
  <img src = "https://contrib.rocks/image?repo=LawsonCheng/poke"/>
</a>
</div>

Pull requests are welcome! Please see [CONTRIBUTING.md](https://github.com/LawsonCheng/poke/blob/main/CONTRIBUTING.md)

## What's Next?
- 🔌 &nbsp;&nbsp;WebSocket (Upcoming)