const auth = require('./basic-auth')

test('Basic Auth tests', async () => {    
    await expect(auth.callback()).resolves.toEqual(200)
    await expect(auth.promise()).resolves.toEqual(200)
})