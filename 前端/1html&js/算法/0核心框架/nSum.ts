function twoSum(numbers: number[], target?: number, start?: number): number[][] {
  target = target || 0
  start = start || 0
  numbers.sort((a, b) => a - b)
  let p1 = start
  let p2 = numbers.length - 1
  const res: number[][] = []
  while (p1 < p2) {
    const sum = numbers[p1] + numbers[p2]
    const left = numbers[p1]
    const right = numbers[p2]
    if (sum < target) {
      while (p1 < p2 && numbers[p1] === left) p1++
    } else if (sum > target) {
      while (p1 < p2 && numbers[p2] === right) p2--
    } else {
      res.push([left, right])
      while (p1 < p2 && numbers[p1] === left) p1++
      while (p1 < p2 && numbers[p2] === right) p2--
    }
  }

  return res
}

function threeSum(nums: number[], target?: number): number[][] {
  target = target || 0
  nums.sort((a, b) => a - b)
  const n = nums.length
  const res: number[][] = []
  // 穷举 threeSum 的第一个数
  for (let i = 0; i < n; i++) {
    // 对 target - nums[i] 计算 twoSum
    const tuples = twoSum(nums, target - nums[i], i + 1)
    tuples.forEach(item => {
      res.push([nums[i], ...item])
    })
    // 跳过第一个数字重复的情况，否则会出现重复结果
    while (i < n - 1 && nums[i] == nums[i + 1]) i++
  }
  return res
}

function nSum(numbers: number[], target?: number, start?: number, n?: number): number[][] {
  /* 注意：调用这个函数之前一定要先给 nums 排序 */

  target = target || 0
  start = start || 0
  n = n || 0

  // 至少是 2Sum，且数组大小不应该小于 n
  const sz = numbers.length
  const res: number[][] = []

  if (n < 2 || sz < n) return res

  // 2Sum 是 base case
  if (n === 2) {
    // 双指针那一套操作
    let p1 = start
    let p2 = numbers.length - 1
    while (p1 < p2) {
      const sum = numbers[p1] + numbers[p2]
      const left = numbers[p1]
      const right = numbers[p2]
      if (sum < target) {
        while (p1 < p2 && numbers[p1] === left) p1++
      } else if (sum > target) {
        while (p1 < p2 && numbers[p2] === right) p2--
      } else {
        res.push([left, right])
        while (p1 < p2 && numbers[p1] === left) p1++
        while (p1 < p2 && numbers[p2] === right) p2--
      }
    }
  } else {
    // n > 2 时，递归计算 (n-1)Sum 的结果
    for (let i = start; i < sz; i++) {
      const sub: number[][] = nSum(numbers, target - numbers[i], i + 1, n - 1)
      sub.forEach(item => {
        res.push([numbers[i], ...item])
      })
      while (i < sz - 1 && numbers[i] === numbers[i + 1]) i++
    }
  }

  return res
}

console.log(nSum([1,0,-1,0,-2,2].sort((a, b) => a - b), 0, 0, 4))