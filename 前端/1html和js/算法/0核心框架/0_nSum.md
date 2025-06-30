# nSum

<https://mp.weixin.qq.com/s/fSyJVvggxHq28a0SdmZm6Q>

## twoSum 问题

先排序 再左右指针
**根据 sum 和 target 的比较，移动左右指针**

如果要求返回所有和为 target 的元素对儿，且不能出现重复

则 **根据 sum 和 target 的比较，移动左右指针** 这一步中 `sum == target` 条件分支 要跳过所有重复的元素

<https://leetcode.cn/problems/kLl5u1/>

通用函数 非答案

```ts
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
```

## 3Sum

力扣第 15 题「三数之和」

<https://leetcode.cn/problems/3sum/>

确定了第一个数字之后，剩下的两个数字可以是什么呢？其实就是和为 `target - nums[i]` 的两个数字

而且不能让第一个数重复，至于后面的两个数，我们复用的 twoSum 函数会保证它们不重复。所以代码中必须用一个 while 循环来保证 3Sum 中第一个元素不重复。

```ts
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
```

排序的复杂度为 `O(NlogN)`，`twoSumTarget` 函数中的双指针操作为 `O(N)`，`threeSumTarget` 函数在 for 循环中调用 `twoSumTarget` 所以总的时间复杂度就是 `O(NlogN + N^2) = O(N^2)`

## 4Sum 问题

力扣第 18 题「四数之和」

<https://leetcode.cn/problems/4sum/>

统一出一个 `nSum` 函数

```ts
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
```

`n == 2` 时是 `twoSum` 的双指针解法，`n > 2` 时就是穷举第一个数字，然后递归调用计算 `(n-1)Sum`，组装答案。