const poke = require('../index');


module.exports.callback = () => {
    return new Promise((resolve, reject) => {
        poke('https://httpbin.org/get', { timeout : 0 }, (result) => {
            if(!result.error){
                result.json().then(json => resolve(json.url)).catch(e => reject(false));
            } else {
                reject(false);
            }
        })
    })
}

module.exports.promise = () => {
    return new Promise((resolve, reject) => poke('https://httpbin.org/get', { 
        timeout : 0
    })
    .promise()
    .then(res => {
        return res.json()
    })
    .then(json => {
        resolve(json.url);
    })
    .catch(err => {
        reject(false);
    }))
}


module.exports.callback_timeout = () => {
    return new Promise((resolve, reject) => {
        poke('https://httpbin.org/get', { timeout : 1 }, (result) => {
            if(/socket hang up/.test((result.error || {}).message || '')){
                resolve(true)
            } else {
                reject(false);
            }
        })
    })
}

module.exports.promise_timeout = () => {
    return new Promise((resolve, reject) => poke('https://httpbin.org/get', {
        timeout : 1
    })
    .promise()
    .then(res => {
        return res.json()
    })
    .then(json => {
        resolve(json.url);
    })
    .catch(err => {
        if(/socket hang up/.test((err.error || {}).message || '')){
            resolve(true)
        } else {
            reject(false);
        }
    }))
}
