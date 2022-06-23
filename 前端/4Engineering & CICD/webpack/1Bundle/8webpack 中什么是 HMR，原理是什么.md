# webpack 中什么是 HMR，原理是什么

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

HMR，`Hot Module Replacement`，热模块替换，见名思意，即无需刷新在内存环境中即可替换掉过旧模块。与 Live Reload 相对应。
`Live Reload`，当代码进行更新后，在浏览器自动刷新以获取最新前端代码。

在 webpack 的运行时中 `__webpack__modules__` 用以维护所有的模块。

而热模块替换的原理，即通过 `chunk` 的方式加载最新的 `modules` ，找到 `__webpack__modules__` 中对应的模块逐一替换，并删除其上下缓存。

伪代码示例

```js
// webpack 运行时代码
const __webpack_modules = [
  (module, exports, __webpack_require__) => {
    __webpack_require__(0);
  },
  () => {
    console.log("这是一号模块");
  },
];

// HMR Chunk 代码
// JSONP 异步加载的所需要更新的 modules，并在 __webpack_modules__ 中进行替换
self["webpackHotUpdate"](0, {
  1: () => {
    console.log("这是最新的一号模块");
  },
});
```

具体的流程

1. `webpack-dev-server` 将打包输出 bundle 使用内存型文件系统控制，而非真实的文件系统。此时使用的是 `memfs` 模拟 node.js fs API
2. 每当文件发生变更时，`webpack` 将会重新编译，`webpack-dev-server` 将会监控到此时文件变更事件，并找到其对应的 `module`。此时使用的是 `chokidar` 监控文件变更
3. `webpack-dev-server` 将会把变更模块通知到浏览器端，此时使用 `websocket` 与浏览器进行交流。此时使用的是 `ws`
4. 浏览器根据 `websocket` 接收到 hash，并通过 hash 以 JSONP 的方式请求更新模块的 chunk
5. 浏览器加载 chunk，并使用新的模块对旧模块进行热替换，并删除其缓存