const get = require('./get')

test('Get Test with callback', async () => {    
    await expect(get.default()).resolves.toEqual('https://httpbin.org/get')
    await expect(get.promise()).resolves.toEqual('https://httpbin.org/get')
})

