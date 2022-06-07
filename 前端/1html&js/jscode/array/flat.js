function flat (arr) {
    const result = []
    const queue = [].concat(arr)  // 将数组元素拷贝至栈，直接赋值会改变原数组
    while (queue.length !== 0) {
        const val = queue.shift()
        if (Array.isArray(val)) {
            queue.unshift(...val) //如果是数组则展开一层插入队首
        } else {
            result.push(val) //如果不是数组就将其取出来放入结果数组中
        }
    }
    return result
}
const arr = [1, 2, 3, 4, [1, 2, 3, [1, 2, 3, [1, 2, 3]]], 5, "string", { name: "弹铁蛋同学" }]
console.log(flat(arr))
  // [1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 1, 2, 3, 5, "string", { name: "弹铁蛋同学" }];
