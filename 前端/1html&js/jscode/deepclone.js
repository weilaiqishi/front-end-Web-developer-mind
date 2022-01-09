// JSON.parse(JSON.stringify());
// 这种写法非常简单，而且可以应对大部分的应用场景，但是它还是有很大缺陷的，比如拷贝其他引用类型、拷贝函数、循环引用等情况。

// 乞丐版
// function deepClone (target) {
//     if (typeof target !== 'object' || target === null) { return target }
//     const result = Array.isArray(target) ? [] : {}
//     for (let key in target) {
//         if (target.hasOwnProperty(key)) {
//             result[key] = deepClone(target)
//         }
//     }
//     return result
// }

// 破除循环引用
// function deepClone (target, map = new WeakMap()) {
//     if (typeof target !== 'object' || target === null) { return }
//     if (map.has(target)) { return map.get(target) }
//     const result = Array.isArray(target) ? [] : {}
//     map.set(target, result)
//     for (let key in target) {
//         if (target.hasOwnProperty(key)) {
//             if(target.hasOwnProperty(key)) {
//                 result[key] = deepClone(target[key], map)
//             }
//         }
//     }
//     return result
// }

// symbol
// function deepClone (target, map = new WeakMap()) {
//     if (typeof target !== 'object' || target === null) { return }
//     if (map.has(target)) { return map.get(target) }
//     const result = Array.isArray(target) ? [] : {}
//     map.set(target, result)
//     for (let key in target) {
//         if (target.hasOwnProperty(key)) {
//             if (target.hasOwnProperty(key)) {
//                 result[key] = deepClone(target[key], map)
//             }
//         }
//     }
//     let symKeys = Object.getOwnPropertySymbols(target) // 查找
//     if (symKeys.length) { // 查找成功	
//         symKeys.forEach(symKey => {
//             if (typeof target[symKey] !== 'object' || target[symKey] === null) {
//                 result[symKey] = target[symKey]
//             } else {
//                 result[symKey] = deepClone(target[symKey], map)
//             }
//         })
//     }
//     return result
// }

// symbol Reflect
// function deepClone (target, map = new WeakMap()) {
//     if (typeof target !== 'object' || target === null) { return target }
//     if (map.has(target)) { return map.get(target) }
//     const result = Array.isArray(target) ? [] : {}
//     map.set(target, result)
//     Reflect.ownKeys(target).forEach(key => {
//         result[key] = deepClone(target[key], map)
//     })
//     return result
// }

// https://juejin.cn/post/6844903929705136141#heading-6  如何写出一个惊艳面试官的深拷贝?
// 考虑数据类型
const mapTag = '[object Map]'
const setTag = '[object Set]'
const arrayTag = '[object Array]'
const objectTag = '[object Object]'
const argsTag = '[object Arguments]'

const boolTag = '[object Boolean]'
const dateTag = '[object Date]'
const numberTag = '[object Number]'
const stringTag = '[object String]'
const symbolTag = '[object Symbol]'
const errorTag = '[object Error]'
const regexpTag = '[object RegExp]'
const funcTag = '[object Function]'

const deepTag = [mapTag, setTag, arrayTag, objectTag, argsTag]
function getType (target) {
    return Object.prototype.toString.call(target)
}
function cloneRegExp (regExp) { return new RegExp(regExp.source, regExp.flags) }
function deepClone1 (target, map = new WeakMap()) {
    // 原始类型
    if (typeof target !== 'object' || target === null) { return target }
    // 破除循环引用
    if (map.has(target)) { return map.get(target) }

    const type = getType(target)
    // 不可遍历类型 （Boolean/Number/String/Error/date/regexp）
    switch (type) {
        case boolTag:
        case numberTag:
        case stringTag:
        case errorTag:
        case dateTag:
            return new target.constructor(target)
        case regexpTag:
            return cloneRegExp(target)
    }

    console.log(type)

    // 克隆set
    if (type === setTag) {
        const cloneTarget = new Set()
        target.forEach(value => {
            cloneTarget.add(deepClone1(value, map))
        })
        return cloneTarget
    }

    // 克隆map
    if (type === mapTag) {
        const cloneTarget = new Map()
        target.forEach((value, key) => {
            cloneTarget.set(key, deepClone1(value, map))
        })
        return cloneTarget
    }

    // 数组和对象
    const result = Array.isArray(target) ? [] : {}
    map.set(target, result)
    Reflect.ownKeys(target).forEach(key => {
        result[key] = deepClone1(target[key], map)
    })
    return result
}


// 广度优先遍历
function deepClone (target) {
    if (typeof target !== 'object' || target === null) { return target }
    const map = new WeakMap()
    const root = {
        result: null,
        target,
    }
    const loopList = [root]
    root.result = Array.isArray(root.target) ? [] : {}
    map.set(root.target, {
        data: root.result,
        time: 1
    })
    // 循环数组
    while (loopList.length) {
        const node = loopList.pop()
        Reflect.ownKeys(node.target).forEach(key => {
            const value = node.target[key]
            if (typeof value !== 'object' || value === null) {
                node.result[key] = value
            } else {
                let cache = map.get(value)
                if (cache) {
                    cache.time++
                    node.result[key] = cache.data
                } else {
                    cache = {
                        data: node.result[key],
                        time: 1,
                    }
                    node.result[key] = Array.isArray(value) ? [] : {}
                    loopList.push({
                        result: node.result[key],
                        target: value,
                    })
                }
                map.set(value, cache)
            }
        })
    }
    return root.result
}

const a = {
    name: "muyiy",
    book: {
        title: "You Don't Know JS",
        price: "45",
    },
    a1: undefined,
    a2: null,
    a3: 123
}
a.book.a = a // Circular类型，即循环应用
console.log(deepClone(a))


const b = {
    date: new Date(),
    map: new Map([["key1", "value1"], ["key2", "value2"]]),
    set: new Set([1,2])
}
console.log(deepClone1(b))