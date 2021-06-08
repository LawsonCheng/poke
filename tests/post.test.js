const post = require('./post')

test('Post Tests', async () => {    
    await expect(post.callback()).resolves.toEqual('kfhk!sdkm!')
    await expect(post.promise()).resolves.toEqual('kfhk!sdkm!')
})

