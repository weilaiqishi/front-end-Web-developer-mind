/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function (nums, target) {
    let left = 0, right = nums.length - 1
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2)
        const midValue = nums[mid]
        if (midValue === target) {
            return mid
        } else if (midValue < target) {
            left = mid + 1
        } else if (midValue > target) {
            right = mid - 1
        }
    }
    return -1
}
console.log(search([-1, 0, 3, 5, 9, 12], 9))