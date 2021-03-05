async function map(fn) {
    const arr = this
    const res = []
    for (let i in arr) {
        const item = fn(arr[i], i)
        if (item instanceof Promise) {
            res.push(await item)
        } else {
            res.push(item)
        }
    }
    return res
}