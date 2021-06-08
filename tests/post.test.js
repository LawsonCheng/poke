const post = require('./post')

test('Post Tests', async () => {    
    await expect(post.default()).resolves.toEqual('kfhk!sdkm!')
    await expect(post.promise()).resolves.toEqual('kfhk!sdkm!')
})

