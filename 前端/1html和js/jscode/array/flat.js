// 数组拍平 要考虑深度
// while循环比较难做 因为while循环一般是用一个栈或数组 会一直加入待处理数组 只有给数组挂上一个当前深度才能处理 [{ current, arr }...]
// 用递归就比较好处理 用工具函数可以多接受一个当前深度参数
Array.prototype.flat = function (depth = 1) {
    if (depth <= 0) { return this }
    const res = []
    this.forEach(item => {
        if (Array.isArray(item)) {
            // 默认扩展一层数组 后续就从第二层开始拍平
            res.push(...flatUtil(item, depth, 1))
        } else {
            res.push(item)
        }
    })
    return res
}

function flatUtil (arr, depth, current) {
    const res = []
    arr.forEach(item => {
        if ((depth > current) && Array.isArray(item)) {
            res.push(...flatUtil(item, depth, current + 1))
        } else {
            res.push(item)
        }
    })
    return res
}

const arr = [1, 2, 3, 4, [1, 2, 3, [1, 2, 3, [1, 2, 3]]], 5, "string", { name: "objectvalue" }]
console.log(arr.flat(0))
console.log(arr.flat())
console.log(arr.flat(2))
console.log(arr.flat(3))

