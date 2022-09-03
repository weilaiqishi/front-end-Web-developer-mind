// 给定一个字符串，只有黑白'b''w'两种字符串，白的可以操作替换为黑的使得黑字符串连续长度为k，遍历一遍字符串求最少操作数
const str1 = ['b', 'w', 'b', 'w', 'b', 'b', 'b', 'b', 'w', 'b', 'b', 'b', 'b', 'b']
const str2 = ['b', 'w', 'w', 'b', 'w', 'b', 'w', 'b', 'w', 'w', 'w']
const k = 5
function fn (str, k) {
  let min = Infinity
  let curUseBack = 0
  let curLen = 0
  let backIndexs = []
  for (let i = 0; i < str.length; i++) {
    if (str[i] === 'b') {
      backIndexs.push(i)
      curUseBack++
    }
    curLen++
    if (curLen === k) {
      min = Math.min(min, k - curUseBack)
      if (min === 0) { return min }

      if (backIndexs.length) {
        const backIndexsLen = backIndexs[backIndexs.length - 1] - backIndexs[0] + 1
        if (backIndexsLen === k) {
          backIndexs.shift()
        }

        curLen = backIndexs[backIndexs.length - 1] - backIndexs[0] + 1
        curUseBack = backIndexs.length
      } else {
        curLen = 0
        curUseBack = 0
      }
    }
  }
  return min
}

console.log(fn(str1, k))
console.log(fn(str2, k))
