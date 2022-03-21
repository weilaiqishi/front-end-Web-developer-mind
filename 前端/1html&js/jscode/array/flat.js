// 栈思想
function flat (arr) {
    const result = []
    const stack = [].concat(arr)  // 将数组元素拷贝至栈，直接赋值会改变原数组
    //如果栈不为空，则循环遍历
    while (stack.length !== 0) {
        const val = stack.pop()
        if (Array.isArray(val)) {
            stack.push(...val) //如果是数组再次入栈，并且展开了一层
        } else {
            result.push(val) //如果不是数组就将其取出来放入结果数组中
        }
    }
    return result
}
const arr = [1, 2, 3, 4, [1, 2, 3, [1, 2, 3, [1, 2, 3]]], 5, "string", { name: "弹铁蛋同学" }]
console.log(flat(arr))
  // [1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 1, 2, 3, 5, "string", { name: "弹铁蛋同学" }];
