// 现在要来实现多个异步的并发控制
// arr存储的是调用后返回promise的函数
function promiseConcurrence(arr, max, callback = () => {}) {
    // 存储并发max的promise数组
    let promiseArr = [], i = 0;

    function runOne() {
        if (i === arr.length) {
            // 所有请求都处理完，返回resolve
            return Promise.resolve();
        }

        // 执行一个函数,i++，保存fetch返回的promise
        let one = arr[i++]()
        console.log(i, 'one', one)
        // 将当前promise存入并发数组
        promiseArr.push(one);
        // 当promise执行完毕后，从数组删除
        // then是异步的，放哪个位置都可以
        one.then(() => {
            // console.log(i, 'one.then', one)
            promiseArr.splice(promiseArr.indexOf(one), 1);
        });

        // 如果当并行数量达到最大
        if (promiseArr.length >= max) {
            // 用race等队列里有promise完成了才调用runOne
            // race返回值是一个待定的 Promise 只要给定的迭代中的一个promise解决或拒绝，就采用第一个promise的值作为它的值
            return Promise.race(promiseArr).then(() => { return runOne() });
        }
        // 否则直接调用runOne让下一个并发入列
        return runOne();
    }

    // arr循环完后
    // 现在promiseArr里面剩下最后max个promise对象
    // 使用all等待所有的都完成之后执行callback
    runOne()
        .then(() => Promise.all(promiseArr))
        .then(() => {
            callback();
        });
}