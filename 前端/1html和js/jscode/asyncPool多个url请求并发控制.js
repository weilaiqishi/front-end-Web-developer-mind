// async-pool 有npm包 https://github.com/rxaviers/async-pool/blob/master/lib/es9.js

function asyncPool (arr, max, callback = () => { }) { // arr存储的是调用后返回promise的函数
  // 存储并发max的promise数组
  const promiseArr = []
  let i = 0
  // 存储结果的数组
  const resArr = new Array(arr.length)

  function runOne () {
    if (i === arr.length) {
      // 所有请求都处理完，返回resolve
      return Promise.resolve()
    }

    // 缓存当前的i用于记录结果
    const temp = i
    // 执行一个函数,i++，保存fetch返回的promise
    let one = fetch(arr[i++])
    // 将当前promise存入并发数组
    promiseArr.push(one)
    // 当promise执行完毕后，从数组删除 保存结果
    function saveRes (res) {
      resArr[temp] = res
      promiseArr.splice(promiseArr.indexOf(one), 1)
    }
    one.then((res) => {
      saveRes({
        status: 'fulfilled',
        value: res,
      })
    }).catch((e) => {
      saveRes({
        status: 'rejected',
        reason: e,
      })
    })

    // 如果当并行数量达到最大
    if (promiseArr.length >= max) {
      // 用race等队列里有promise完成了才调用runOne
      // race返回值是一个待定的 Promise 只要给定的迭代中的一个promise解决或拒绝，就采用第一个promise的值作为它的值
      return Promise.race(promiseArr).then(() => { return runOne() })
    }
    // 否则直接调用runOne让下一个并发入列
    return runOne()
  }

  // arr循环完后
  // 现在promiseArr里面剩下最后max个promise对象
  // 使用all等待所有的都完成之后执行callback
  runOne()
    .then(() => Promise.all(promiseArr))
    .then(() => {
      callback(resArr)
    })
}

const urls = Array.from({ length: 10 }, (v, k) => k)
console.log(urls)

const fetch = function (idx) {
  return new Promise(resolve => {
    console.log(`start request ${idx}`)
    const timeout = parseInt(Math.random() * 2000)
    setTimeout(() => {
      console.log(`end request ${idx}`)
      resolve(idx)
    }, timeout)
  })
}

const max = 4

const callback = (results) => {
  console.log(results)
}

asyncPool(urls, max, callback)