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
a.book.a = a
console.log(deepClone(a))