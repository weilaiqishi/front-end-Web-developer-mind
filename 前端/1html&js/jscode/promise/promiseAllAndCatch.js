let Promise1 = new Promise(function (resolve, reject) {
    try {
        throw '1'
        reject(1)
        console.log('log', 1)
    } catch (err) {
        console.log('inline catch -> ', {err})
    }

})
let Promise2 = new Promise(function (resolve, reject) {
    resolve(2)
    console.log('log', 2)
})
let Promise3 = new Promise(function (resolve, reject) {
    reject(3)
    console.log('log', 3)
})

let p = Promise.all([Promise1, Promise2, Promise3])

p.then(function(res) {
    console.log({res})
}, function (err) {
    // 只要有失败，则失败
    console.log({err})
})