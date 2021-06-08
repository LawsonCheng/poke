const poke = require('../index');

module.exports.callback = () => {
    return new Promise((resolve, reject) => {
        poke(
            'https://httpbin.org/put', 
            {
                method : 'PUT',
                body : JSON.stringify({
                    name : 'kfhk!sdkm!'
                })
            }, 
            (result) => {
                if(!result.error){
                    result.json().then(json => resolve(json.json.name)).catch(e => reject(false))
                } else {
                    reject(false)
            }
        })
    })
}

module.exports.promise = () => {
    return new Promise((resolve, reject) => 
        poke(
            'https://httpbin.org/put',
            {
                method : 'PUT',
                body : JSON.stringify({
                    name : 'kfhk!sdkm!'
                })
            }
        )
        .then(res => {
            return res.json()
        })
        .then(json => {
            resolve(json.json.name);
        })
        .catch(err => {
            reject(false);
        }))
}