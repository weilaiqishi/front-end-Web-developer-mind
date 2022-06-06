# Event Loop

## 参考资料

[Event Loop 和 JS 引擎、渲染引擎的关系](https://juejin.cn/post/6961349015346610184)
[浏览器和 Node.js 的 EventLoop 为什么这么设计？](https://juejin.cn/post/7049385716765163534)

## JS 引擎

### 组成

js 引擎包括 parser、解释器、gc 再加一个 JIT 编译器这几部分。

- parser： 负责把 javascript 源码转成 AST
- interperter：解释器， 负责转换 AST 成字节码，并解释执行
- JIT compiler：对执行时的热点函数进行编译，把字节码转成机器码，之后可以直接执行机器码
- gc（garbage collector）：垃圾回收器，清理堆内存中不再使用的对象

### 编译流水线

一般的 JS 引擎的编译流水线是 parse 源码成 AST，之后 AST 转为字节码，解释执行字节码。运行时会收集函数执行的频率，对于到达了一定阈值的热点代码，会把对应的字节码转成机器码（JIT），然后直接执行。这就是 js 代码能够生效的流程。

![JS编译流水线](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24c2678e7ffa4239ba55ec02b4bbc1a9~tplv-k3u1fbpfcp-watermark.awebp)

## 渲染引擎

渲染时会把 html、css 分别用 parser 解析成 dom 和 cssom，然后合并到一起，并计算布局样式成绝对的坐标，生成渲染树，之后把渲染树的内容复制到显存就可以由显卡来完成渲染。
每一次渲染流程叫做一帧，浏览器会有一个帧率（比如一秒 60帧）来刷新。

![渲染引擎](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/abd0e8d5431a451fad4287042a1e6b22~tplv-k3u1fbpfcp-watermark.awebp)

## 如何结合 JS 引擎和渲染引擎

JS 引擎只会不断执行 JS 代码，渲染引擎也是只会布局和渲染。但是要完成一个完整的网页应用，这两者都需要。

综合两者的思路有多线程和单线程

### 多线程

安卓 ui 架构: 在主线程里面完成 ui 的更新，事件的绑定，其他逻辑可以放到别的线程，然后完成以后在消息队列中放一个消息，主线程不断循环的取消息来执行。

electron ui 架构: electron 中分为了主进程和渲染进程，window 相关的操作只能在主线程，由渲染进程向主进程发消息。

### 单线程

在一个线程内进行 dom 操作和逻辑计算，渲染和 JS 执行相互阻塞。

#### 宿主环境

JS 引擎并不提供 event loop（可能很多同学以为 event loop 是 JS 引擎提供的，其实不是），它是宿主环境为了集合渲染和 JS 执行，也为了处理 JS 执行时的高优先级任务而设计的机制。
宿主环境有浏览器、node、跨端引擎等，不同的宿主环境有一些区别：

注入的全局 api 不同

- node 会注入一些全局的 require api，同时提供 fs、os 等内置模块
- 浏览器会注入 w3c 标准的 api
- 跨端引擎会注入设备的 api，同时会注入一套操作 ui 的 api（可能是对标 w3c 的 api 也可能不是）

event loop 的实现不同

- 浏览器里面主要是调度渲染和 JS 执行，还有 worker
- node 里面主要是调度各种 io
- 跨端引擎也是调度渲染和 JS 执行

## 浏览器的 event loop

JavaScript 是用于实现网页交互逻辑的，涉及到 dom 操作，如果多个线程同时操作需要做同步互斥的处理，为了简化就设计成了单线程，但是如果单线程的话，遇到定时逻辑、网络请求又会阻塞住。怎么办呢？
可以加一层调度逻辑。把 JS 代码封装成一个个的任务，放在一个任务队列中，主线程就不断的取任务执行就好了。
每次取任务执行，都会创建新的调用栈。
![把 JS 代码封装成一个个的任务](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92a182ea82244f4aa01d87db77abc553~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)

在其他线程执行的异步任务包括定时器（setTimeout、setInterval），UI 渲染、网络请求（XHR 或 fetch），执行完了之后在任务队列里放个任务，告诉主线程可以继续往下执行了。
因为这些异步任务是在别的线程执行完，然后通过任务队列通知下主线程，是一种事件机制，所以这个循环叫做 Event Loop。
![在后台线程执行](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cfac5f08713b46dd8f6933e4f53ed1da~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)

为了支持高优先级任务调度，就搞一个高优先级的任务队列，每执行完一个普通任务，都去把所有高优先级的任务给执行完，之后再去执行普通任务。
其中普通任务叫做 MacroTask（宏任务），高优任务叫做 MicroTask（微任务）。
**宏任务包括：setTimeout、setInterval、requestAnimationFrame、Ajax、fetch、script 标签的代码。**
**微任务包括：Promise.then、MutationObserver、Object.observe。**
怎么理解宏微任务的划分呢？
定时器、网络请求这种都是在别的线程跑完之后通知主线程的普通异步逻辑，所以都是宏任务。
而高优任务的这三种也很好理解，MutationObserver 和 Object.observe 都是监听某个对象的变化的，变化是很瞬时的事情，肯定要马上响应，不然可能又变了，Promise 是组织异步流程的，异步结束调用 then 也是很高优的。
这就是浏览器里的 Event Loop 的设计：`设计 Loop 机制和 Task 队列是为了支持异步，解决逻辑执行阻塞主线程的问题，设计 MicroTask 队列的插队机制是为了解决高优任务尽早执行的问题。`
![微任务](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0f9bb5d2a0eb4e36a3bc2928b147650d~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)

每次 loop 结束都 check 的方式来综合渲染、JS 执行、worker 等，让它们都能在一个线程内得到执行（渲染其实是在别的线程，但是会和 JS 线程相互阻塞）。
![一次loop](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/93dc8465f5304cf8977fe005d6f0ef15~tplv-k3u1fbpfcp-watermark.awebp)

## Node.js 的 Event loop

浏览器的 Event Loop 只分了两层优先级，一层是宏任务，一层是微任务。但是宏任务之间没有再划分优先级，微任务之间也没有再划分优先级。

而 Node.js 任务宏任务之间也是有优先级的，比如定时器 Timer 的逻辑就比 IO 的逻辑优先级高，因为涉及到时间，越早越准确；而 close 资源的处理逻辑优先级就很低，因为不 close 最多多占点内存等资源，影响不大。

于是就把宏任务队列拆成了五个优先级：Timers、Pending、Poll、Check、Close。
![Node宏任务五个优先级](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2f16ec03bf614d5b9d01fe55b126758b~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)
`Timers Callback`： 涉及到时间，肯定越早执行越准确，所以这个优先级最高很容易理解。
`Pending Callback`：处理网络、IO 等异常时的回调，有的 *niux 系统会等待发生错误的上报，所以得处理下。
`Poll Callback`：处理 IO 的 data，网络的 connection，服务器主要处理的就是这个。
`Check Callback`：执行 setImmediate 的回调，特点是刚执行完 IO 之后就能回调这个。
`Close Callback`：关闭资源的回调，晚点执行影响也不到，优先级最低。
![Node.js 的 Event Loop](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7d212112be464570ba56bd5ea0561fa2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)
