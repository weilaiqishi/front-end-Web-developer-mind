# 如何提升 webpack 构建资源的速度

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

使用 `speed-measure-webpack-plugin` 可评估每个 loader/plugin 的执行耗时。

## 更快的 loader: swc

在 `webpack` 中耗时最久的当属负责 AST 转换的 loader。

当 loader 进行编译时的 AST 操作均为 CPU 密集型任务，使用 Javascript 性能低下，此时可采用高性能语言 rust 编写的 `swc`。

比如 Javascript 转化由 `babel` 转化为更快的 `swc`

```js
module: {
  rules: [
    {
      test: /\.m?js$/,
      exclude: /(node_modules)/,
      use: {
        loader: "swc-loader",
      },
    },
  ];
}
```

## 持久化缓存: cache

`webpack5` 内置了关于缓存的插件，可通过 `cache` 字段配置开启
它将 `Module`、`Chunk`、`ModuleChunk` 等信息序列化到磁盘中，二次构建避免重复编译计算，编译速度得到很大提升。

```js
{
  cache: {
    type: "filesystem";
  }
}
```

如对一个 JS 文件配置了 `eslint`、`typescript`、`babel` 等 `loader`，他将有可能执行五次编译，被五次解析为 AST

- acorn: 用以依赖分析，解析为 acorn 的 AST
- eslint-parser: 用以 lint，解析为 espree 的 AST
- typescript: 用以 ts，解析为 typescript 的 AST
- babel: 用以转化为低版本，解析为 @babel/parser 的 AST
- terser: 用以压缩混淆，解析为 acorn 的 AST

而当开启了持久化缓存功能，最耗时的 AST 解析将能够从磁盘的缓存中获取，再次编译时无需再次进行解析 AST。
**得益于持久化缓存，二次编译甚至可得到与 Unbundle 的 vite 等相近的开发体验**

在 webpack4 中，可使用 `cache-loader` 仅仅对 `loader` 进行缓存。需要注意的是该 loader 目前已是 @deprecated 状态。

## 多进程: thread-loader

`thread-loader` 为官方推荐的开启多进程的 loader，可对 babel 解析 AST 时开启多线程处理，提升编译的性能。

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "thread-loader",
            options: {
              workers: 8,
            },
          },
          "babel-loader",
        ],
      },
    ],
  },
};
```

在 `webpack4` 中，可使用 `happypack plugin`，但需要注意的是 happypack 已经久不维护了。

`thread-loader` 的整个工作流程

1. thread-loader 的 pitch 方法拦截它后面的所有 loader；
2. 创建 WorkerPool 实例 workerPool，它是个进程池子，用以调度进程；调度工作依赖使用 neo-async/queue.js 创建的 poolQueue 队列；
3. poolQueue.push(data, callback)；
4. poolQueue.push 后会执行 poolQueue 的 worker 函数 —— distributeJob 创建子进程；
5. distributeJob 创建子进程，通过自定义管道通信，利用 readPipe 接收子进程消息，利用 writePipe 向子进程发送消息，通信的数据载体是 JSON 格式字符串；
6. 子进程接收来自父进程发送过来的消息运行 loader，碍于进程间通信限制，子进程自己构造了一个 loaderContext 对象，当用到父进程 loaderContext 中的方法时，构造的 loaderContext 对象会通过进程间通信委托父进程实现；
7. 当子进程完成 runLoaders 工作后，在回调中利用管道向父进程发送结果；
8. 父进程收到消息后，找到本次运行 loader 时对应的回调函数，在回调函数中把这些结果 —— 各种类型的依赖，添加到构建中；

[原文链接](https://juejin.cn/post/7110039728488972324)
