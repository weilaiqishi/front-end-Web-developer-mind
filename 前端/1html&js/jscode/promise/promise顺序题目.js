console.log(1)
new Promise((resolve, reject) => {
  resolve(4)
  setTimeout(() => {
    new Promise((resolve, reject) => {
      console.log(2)
    }).then(() => {
      console.log(3)
    })
  })
})
.then((data) => { // 变形
  console.log('data -> ', data)
  data = 5
})
.then((data) => {
  // 先打印 8 后打印 undefined， 因为 4 和 8 是同一批微任务 他们的then又是一批微任务  所有微任务执行完才到 setTimeout 宏任务
  console.log('data -> ', data) // data ->  undefined
  // 这里resolve过的promise 后续的then如果有return 则后面的then接受的参数为reture的值 否则是undefined
})

setTimeout(() => {
  console.log(6)
})

new Promise((resolve, reject) => {
  console.log(7)
  resolve()
})
.then(() => {
  console.log(8)
})
.then(() => {
  console.log(9)
})
console.log(10)