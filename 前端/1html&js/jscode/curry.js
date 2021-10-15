function curry(fn) {
    if (fn.length <= 1) return fn
    const generator = (...args) => {
        if (fn.length === args.length) {
            return fn(...args)
        } else {
            return (...args2) => {
                return generator(...args, ...args2)
            }
        }
    }
    return generator
}

const count4 = function(a,b,c,d) {
    return a+b+c+d
}
debugger
let curryCount4 = curry(count4)
console.log(curryCount4.toString())
for (let i = 0; i < 4; i++) {
    curryCount4 = curryCount4(i)
    console.log(String(curryCount4))
} 