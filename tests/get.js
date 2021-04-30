/**
 * @TODO :add more tests 
 */

const poke = require('../index');

poke(
    'https://carlig.com', 
    {
        path : "/api/articles",
    }
)
.then(res => {
    console.log('-----> body: ', res);
    return res.json()
})
.then(json => {
    console.log('-----> json: ', json)
})
.catch(err => {
    console.log('----> Err: ', err);
})