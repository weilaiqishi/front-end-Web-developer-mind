let m = 60
let n = 7
let dai = {}
for (let i = 0; i < n; i++) {
  dai[i] = []
}
// 记录一个数被拆成两个数的组合
let twoMap = {}
function sort (a, b) {
  if (a > b) {
    return 1
  } else if (a < b) {
    return -1
  } else {
    return 0
  }
}

function find (value, num, time = 0) {
  // 第一代
  if (time === 0) {
    dai[0].push(value + '')
    // 拆出下一代
    find(value, num, 1)
    return
  }

  // 1不能拆
  if (value === 1) { return }
  // 代数超了不能拆
  if (time === num) { return }

  // 拆一次
  // 遍历上一代中的情况，对每种情况的每个数拆出下一代
  dai[time - 1].forEach(str => {
    // 上一次组合情况
    const last = str.split(',').map(item => parseInt(item))
    // 每个数去重 并排除1 1不能拆
    const numberArr = [...new Set(last)].filter(i => i !== 1)
    numberArr.forEach(num => {
      // 拷贝组合
      const copy = last.concat()
      // 先删去组合中这个数，因为他要被拆
      copy.splice(copy.indexOf(num), 1)

      // 求一个整数被分成两个整数的情况
      if (!twoMap[num]) {
        twoMap[num] = []
        // 可以拆的次数
        const len = Math.floor(num / 2)
        // 拆一个数
        for (let i = 1; i <= len; i++) {
          // 记录一个整数被分成两个整数的情况
          twoMap[num].push([i, num - i])
        }
      }

      // 新的组合数组
      const newArr = []
      twoMap[num].forEach(item => {
       // 新组合
       const newAdd = copy.concat(item)
       // 排序后变成逗号隔开的str加入
       newArr.push(newAdd.sort(sort).join(','))
      })

      // 统计
      dai[time] = dai[time].concat(newArr)
    })
    // 统计去重
    dai[time] = [...new Set(dai[time])]
  })

  // 提高代数,继续递归
  find(value, num, ++time)
}
find(m, n)

// console.log(dai)
console.log(Object.values(dai).reduce((acc, cur) => { return acc + cur.length }, 0))
