let pending = false
// 存放需要异步调用的任务
const callbacks = []
function flushCallbacks () {
  pending = false
  // 循环执行队列
  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i]()
  }
  // 清空
  callbacks.length = 0
}

function nextTick(cb) {
    callbacks.push(cb)
    if (!pending) {
      pending = true
      // 利用Promise的then方法 在下一个微任务队列中把函数全部执行 
      // 在微任务开始之前 依然可以往callbacks里放入新的回调函数
      Promise.resolve().then(flushCallbacks)
    }
}

// 测试一下：
// 第一次调用 then方法已经被调用了 但是 flushCallbacks 还没执行
nextTick(() => console.log(1))
// callbacks里push这个函数
nextTick(() => console.log(2))
// callbacks里push这个函数
nextTick(() => console.log(3))

// 同步函数优先执行
console.log(4)

// 此时调用栈清空了，浏览器开始检查微任务队列，发现了 flushCallbacks 方法，执行。
// 此时 callbacks 里的 3 个函数被依次执行。

// 4
// 1
// 2
// 3
