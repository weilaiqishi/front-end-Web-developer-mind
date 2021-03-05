async function find (fn) {
    const arr = this
    for (let i in arr) {
        let res = fn(arr[i], i)
        res instanceof Promise && (res = await res)
        if(res) return arr[i]
    }
    return undefined
}