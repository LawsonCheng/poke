const poke = require('../index');

module.exports.callback = () => {
    return new Promise((resolve, reject) => {
        poke(
            'https://httpbin.org/delete', {
                method : 'DELETE'
            }, (result) => {
            if(!result.error){
                resolve(result.statusCode);
            } else {
                reject(false);
            }
        })
    })
}

module.exports.promise = () => {
    return new Promise((resolve, reject) => 
        poke(
            'https://httpbin.org/delete',
            {
                method : 'DELETE'
            }
        )
        .then(res => resolve(res.statusCode))
        .catch(err => reject(false)))
}