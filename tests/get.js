const poke = require('../index');

module.exports.callback = () => {
    return new Promise((resolve, reject) => {
        poke('https://httpbin.org/get', {}, (result) => {
            if(!result.error){
                result.json().then(json => resolve(json.url)).catch(e => reject(false));
            } else {
                reject(false);
            }
        })
    })
}

module.exports.promise = () => {
    return new Promise((resolve, reject) => poke('https://httpbin.org/get')
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