const gzip = require('./gzip')

test('Get Test with callback', async () => {    
    await expect(gzip.callback()).resolves.toEqual(true)
    await expect(gzip.promise()).resolves.toEqual(true)
})

