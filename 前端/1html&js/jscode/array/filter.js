async function filter(fn) {
    const arr = this
    const result = []
    for (let i in arr) {
        let res = fn(arr[i], i)
        res instanceof Promise && (res = await res)
        res && result.push(arr[i])
    }
    return result
}