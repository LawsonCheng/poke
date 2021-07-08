const poke = require('../index');

module.exports.callback = () => {
    return new Promise((resolve, reject) => {
        poke('https://httpbin.org/gzip', {}, (result) => {
            if(!result.error){
                result.json().then(json => resolve(json.gzipped)).catch(e => reject(false));
            } else {
                reject(false);
            }
        })
    })
}

module.exports.promise = () => {
    return new Promise((resolve, reject) => poke('https://httpbin.org/gzip')
    .promise()
    .then(res => {
        return res.json()
    })
    .then(json => {
        resolve(json.gzipped);
    })
    .catch(err => {
        reject(false);
    }))
}