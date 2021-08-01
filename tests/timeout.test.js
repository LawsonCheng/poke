const timeout = require('./timeout')

test('Timeout Tests', async () => {    
    await expect(timeout.callback_timeout()).resolves.toEqual(true)
    await expect(timeout.promise_timeout()).resolves.toEqual(true)
    await expect(timeout.callback()).resolves.toEqual('https://httpbin.org/get')
    await expect(timeout.promise()).resolves.toEqual('https://httpbin.org/get')
})

