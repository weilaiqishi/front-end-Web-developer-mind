function myCall(fn, obj, ...args) {
    obj = obj ?? globalThis
    const key = Symbol()
    obj[key] = fn
    const res = obj[key](...args)
    obj[key] = null
    return res
}

Function.prototype.myBind = function (context, ...args) {
    const _this = this
    if (typeof this !== 'function') {
        throw new TypeError('Bind must be called on a funiton')
    }
    // const args = [...arguments].slice(1)
    return function F(...args1) {
        if (this instanceof F) {
            // return new _this(...args, ...arguments)
            return new _this(...args, ...args1)
        }
        // return _this.call(context, ...args, ...arguments)
        return _this.call(context, ...args, ...args1)
    }
}

const a = {
    name: '1',
    say () {
        console.log(this.name)
    }
}
const b = {
    name: '2'
}
myCall(a.say,b)