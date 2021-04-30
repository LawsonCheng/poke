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
poke(
    // host url, starts with http or https
    'https://carlig.com', 
    // options
    {
        path : "/api/articles",
        method : "get"
    }
)
.then(result => {
    // result in plain text form
    console.log('> status code: ', result.statusCode)
    console.log('> body: ', result.body)
    // call json
    return result.json()
})
.then(json => {
    // here is the json object
    console.log('> json: ', json)
})
.catch(err => {
    console.log('> Error: ', err)
})

// using callback
poke(
    'https://carlig.com', 
    {
        path : "/api/articles",
        method : "get"
    },
    // callback
    (error, result) => {
        // Error object
        console.log('> error: ', error)
        // result object
        console.log('> status code: ', result.statusCode)
        console.log('> body: ', result.body)
        // to json
        result.json((json_error, json_result) => {
            // error on parsing?
            console.log('> parse json error:', json_error)
            // here is the json object
            console.log('> json: ', json)
        })
    }
)

```


## Become a contirbutor!
Please see [CONTRIBUTING.md](https://github.com/LawsonCheng/poke/blob/main/CONTRIBUTING.md)