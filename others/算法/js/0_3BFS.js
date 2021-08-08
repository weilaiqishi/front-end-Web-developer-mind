// 752. 打开转盘锁
// https://leetcode-cn.com/problems/open-the-lock/

/**
 * @param {string[]} deadends
 * @param {string} target
 * @return {number}
 */

// 将s[j]向上拨动一次
function plusOne(str, index) {
    const arr = str.split('')
    arr[index] = arr[index] == 9 ? 0 : arr[index] - 0 + 1
    return arr.join('')
}
// 将s[j]向下拨动一次
function minusOne(str, index) {
    const arr = str.split('')
    arr[index] = arr[index] == 0 ? 9 : arr[index] - 1
    return arr.join('')
}

// // 双向BFS 6692 ms	49.4 MB
// const openLock = function (deadends, target) {
//     if (deadends.includes(target)) { return -1 }
//     const q = []
//     const visited = []
//     // 从起点开始启动广度优先搜索
//     let step = 0
//     q.push('0000')
//     visited.push('0000')

//     let q1 = []
//     let visited1 = []
//     let step1 = 0
//     q1.push(target)
//     visited1.push(target)

//     while (q.length && q1.length) {
//         /* 判断是否到达终点 */
//         if (q.some(item => q1.includes(item))) {
//             return step - 0 + step1
//         }
//         if (q.some(item => item === target)) { return step }
//         step = run(deadends, q, visited, step)
//         step1 = run(deadends, q1, visited1, step1)
//     }
//     return -1
// }

// function run(deadends, q, visited, step) {
//     const currentLength = q.length
//     /* 将当前队列中的所有节点向周围扩散 */
//     for (let i = 0; i < currentLength; i++) {
//         const currentStr = q.shift()
//         /* 错误的不需要往下遍历 */
//         if (deadends.includes(currentStr)) { continue }
//         /* 将一个节点的未遍历相邻节点加入队列 */
//         for (let j = 0; j < 4; j++) {
//             const minusOneStr = minusOne(currentStr, j)
//             const plusOneStr = plusOne(currentStr, j)
//             const nextStrs = [minusOneStr, plusOneStr]
//             nextStrs.forEach(nextStr => {
//                 if (!visited.includes(nextStr)) {
//                     q.push(nextStr)
//                     visited.push(nextStr)
//                 }
//             })
//         }
//     }
//     return step + 1
// }

// 双向BFS Set 740 ms	52.8 MB
const openLock = function (deadends, target) {
    if (deadends.includes(target)) { return -1 }
    const deads = new Set(deadends)
    const q = []
    const visited = new Set()
    // 从起点开始启动广度优先搜索
    let step = 0
    q.push('0000')
    visited.add('0000')

    let q1 = []
    let visited1 = new Set()
    let step1 = 0
    q1.push(target)
    visited1.add(target)

    while (q.length && q1.length) {
        /* 判断是否到达终点 */
        if (q.some(item => q1.includes(item))) {
            return step - 0 + step1
        }
        if (q.some(item => item === target)) { return step }
        step = run(deadends, q, visited, step)
        step1 = run(deadends, q1, visited1, step1)
    }
    return -1
}

function run(deadends, q, visited, step) {
    const currentLength = q.length
    /* 将当前队列中的所有节点向周围扩散 */
    for (let i = 0; i < currentLength; i++) {
        const currentStr = q.shift()
        /* 错误的不需要往下遍历 */
        if (deadends.includes(currentStr)) { continue }
        /* 将一个节点的未遍历相邻节点加入队列 */
        for (let j = 0; j < 4; j++) {
            const minusOneStr = minusOne(currentStr, j)
            const plusOneStr = plusOne(currentStr, j)
            const nextStrs = [minusOneStr, plusOneStr]
            nextStrs.forEach(nextStr => {
                if (!visited.has(nextStr)) {
                    q.push(nextStr)
                    visited.add(nextStr)
                }
            })
        }
    }
    return step + 1
}

console.log(openLock(["0201", "0101", "0102", "1212", "2002"], "0202"), 6)
// console.log(openLock(["0000"], "8888"), -1)
// console.log(openLock(["8888"], "0009"), 1)