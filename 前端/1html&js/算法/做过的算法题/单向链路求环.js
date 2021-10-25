let readline = require('readline')
let rl = readline.createInterface({ input: process.stdin, output: process.stdout })
let input = []

// ----
let lineNum = 1
// ----

rl.on('line', (line) => {
  input.push(line)
  if (input.length === lineNum) {

    // ----
    console.log(find(input[0]))
    // ----

    rl.close
  }
})

function sort (a, b) {
  if (a > b) {
    return 1
  } else if (a < b) {
    return -1
  } else {
    return 0
  }
}

function find (str) {
  const arrstr = str.substr(2, str.length - 4)
  const arr = arrstr.split('],[')
  const pointMap = arr.map(item => item.split(','))
  const pointObj = pointMap.reduce((acc, cur) => {
    acc[cur[0]] = cur[1]
    return acc
  }, {})
  // 如果点的数量大于map数 就没有环
  if (pointMap.length > Object.keys(pointObj).length) { return 0 }
  // 快慢指针
  let fast, slow
  fast = slow = pointMap[0][0]
  do {
    // fast跑两次 每次都判断是不是追上了slow 没追上才继续跑
    fast = pointObj[fast]
    if (fast !== slow) {
      fast = pointObj[fast]
      if (fast !== slow) {
        slow = pointObj[slow]
      }
    }
  } while (fast !== slow)
  // fast追上了slow
  // 此时fast不跑了，做一个标记，让slow再跑一圈来记录长度
  let len = 0
  do {
    slow = pointObj[slow]
    len++
  } while (fast !== slow)
  
  return len
}