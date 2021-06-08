const _delete = require('./delete')

test('delete Test with callback', async () => {    
    await expect(_delete.callback()).resolves.toEqual(200)
    await expect(_delete.promise()).resolves.toEqual(200)
})

