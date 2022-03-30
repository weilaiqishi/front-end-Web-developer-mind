# webpack 中的 code spliting 是如何动态加载 chunk 的？

一个 `webpack` 的运行时，包括最重要的两个数据结构：

1. `__webpack_modules__`: 维护一个所有模块的数组。将入口模块解析为 AST，根据 AST 深度优先搜索所有的模块，并构建出这个模块数组。每个模块都由一个包裹函数 `(module, module.exports, __webpack_require__)` 对模块进行包裹构成。
2. `__webpack_require__(moduleId)`: 手动实现加载一个模块。对已加载过的模块进行缓存，对未加载过的模块，根据 id 定位到 `__webpack_modules__` 中的包裹函数，执行并返回 `module.exports`，并缓存。

## code spliting

在 webpack 中，通过 `import()` 可实现 code spliting。假设我们有以下文件:

```js
// 以下为 index.js 内容
import("./sum").then((m) => {
  m.default(3, 4);
});

// 以下为 sum.js 内容
const sum = (x, y) => x + y;
export default sum;
```

我们将使用以下简单的 `webpack` 配置进行打包，具体示例可参考 [node-examples:code-spliting](https://github.com/shfshanyue/node-examples/blob/master/engineering/webpack/code-spliting/build.js)

```js
{
  entry: './index.js',
  mode: 'none',
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: 'chunk.[name].[id].[contenthash].js',
    path: path.resolve(__dirname, 'dist/deterministic'),
    clean: true
  },
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'deterministic'
  }
}
```

## 运行时解析

通过观察打包后的文件 `dist/deterministic/main.xxxxxx.js`，可以发现: 使用 `import()` 加载数据时，以上代码将被 `webpack` 编译为以下代码

```js
__webpack_require__
  .e(/* import() | sum */ 644)
  .then(__webpack_require__.bind(__webpack_require__, 709))
  .then((m) => {
    m.default(3, 4);
  });
```

此时 `644` 为 chunkId，观察 `chunk.sum.xxxx.js` 文件，以下为 `sum` 函数所构建而成的 chunk:

```js
"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([
  [644],
  {
    /***/ 709: /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
        /* harmony export */
      });
      const sum = (x, y) => x + y;

      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = sum;

      /***/
    },
  },
]);
```

以下两个数据结构是加载 `chunk` 的关键:

1. `__webpack_require__.e`: 加载 chunk。该函数将使用 `document.createElement('script')` 异步加载 chunk 并封装为 Promise。
1. `self["webpackChunk"].push`: JSONP cllaback，收集 modules 至 `__webpack_modules__`，并将 `__webpack_require__.e` 的 Promise 进行 resolve。

实际上，在 `webpack` 中可配置 `output.chunkLoading` 来选择加载 chunk 的方式，比如选择通过 `import()` 的方式进行加载。(由于在生产环境需要考虑 import 的兼容性，目前还是 JSONP 方式较多)

```js
{
  entry: './index.js',
  mode: 'none',
  output: {
    filename: 'main.[contenthash].js',
    chunkFilename: '[name].chunk.[chunkhash].js',
    path: path.resolve(__dirname, 'dist/import'),
    clean: true,
    // 默认为 `jsonp`
    chunkLoading: 'import'
  }
})
```

可参考示例 [webpack 运行时代码](https://github.com/shfshanyue/node-examples/blob/master/engineering/webpack/code-spliting/example/runtime.js) 中查看加载一个 chunk 的实现。
