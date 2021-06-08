const put = require('./put')

test('Put Tests', async () => {    
    await expect(put.callback()).resolves.toEqual('kfhk!sdkm!')
    await expect(put.promise()).resolves.toEqual('kfhk!sdkm!')
})

