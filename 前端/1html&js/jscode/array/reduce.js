async function reduce (fn, initialValue) {
    const arr = this
    if (!(fn instanceof Function)) {
        throw new TypeError(`${fn} is not a function at ${typeof arr}.reduce`)
    }
    if (!arr.length && initialValue === undefined) {
        throw new TypeError(`Reduce of empty array with no initial value at ${typeof arr}.reduce`)
    }
    for (let index in arr) {
        const res = fn(initialValue, arr[index], index, arr)
        if (res instanceof Promise) {
            initialValue = await res
        } else {
            initialValue = res
        }
    }
    return initialValue
}