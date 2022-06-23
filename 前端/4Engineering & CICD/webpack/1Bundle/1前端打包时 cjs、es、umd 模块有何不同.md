# 模块化方案

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

前端打包时 cjs、es、umd 模块有何不同

## cjs (commonjs)

`commonjs` 是 Node 中的模块规范，通过 `require` 及 `exports` 进行导入导出 (进一步延伸的话，`module.exports` 属于 `commonjs2`)

`cjs` 模块可以运行在 node 环境及 webpack 环境下的，但不能在浏览器中*直接*使用。但如果你写前端项目在 webpack 中，也可以理解为它在浏览器和 Node 都支持。

比如，著名的全球下载量前十 10 的模块 [ms](https://npm.devtool.tech/ms) 只支持 `commonjs`，但并不影响它在前端项目中使用(通过 webpack)，但是你想通过 [cdn](https://npm.devtool.tech/cdn/ms) 的方式直接在浏览器中引入，估计就会出问题了
![ms npm信息](https://cdn.jsdelivr.net/gh/weilaiqishi/mymarkdownpicture/webpack/bundle_ms.png)

一个 `cjs` 的例子

```js
// sum.js
exports.sum = (x, y) => x + y;

// index.js
const { sum } = require("./sum.js");
```

由于 `cjs` 为动态加载，可直接 `require` 一个变量

```js
require(`./${a}`);
```

## esm (es module)

`esm` 是 tc39 对于 ESMAScript 的模块话规范，正因是语言层规范，**因此在 Node 及 浏览器中均会支持**。

它使用 `import/export` 进行模块导入导出.

```js
// sum.js
export const sum = (x, y) => x + y;

// index.js
import { sum } from "./sum";
```

npm包示例: [array-uniq](https://cdn.jsdelivr.net/npm/array-uniq/index.js)

`esm` 为静态导入，正因如此，可在编译期进行 **Tree Shaking**，减少 js 体积。

如果需要动态导入，tc39 为动态加载模块定义了 API: `import(module)` 。可将以下代码粘贴到控制台执行

```js
const ms = await import("https://cdn.skypack.dev/ms@latest");

ms.default(1000);
```

esm 是未来的趋势，目前一些 CDN 厂商，前端构建工具均致力于 cjs 模块向 esm 的转化，比如 `skypack`、 `snowpack`、`vite` 等。

目前，在浏览器与 node.js 中均原生支持 esm。

- cjs 模块输出的是一个值的拷贝，esm 输出的是值的引用
- cjs 模块是运行时加载，esm 是编译时加载

## umd

一种兼容 `cjs` 与 `amd` 的模块，既可以在 node/webpack 环境中被 `require` 引用，也可以在浏览器中直接用 CDN 被 `script.src` 引入。

```js
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD
    define(["jquery"], factory);
  } else if (typeof exports === "object") {
    // CommonJS
    module.exports = factory(require("jquery"));
  } else {
    // 全局变量
    root.returnExports = factory(root.jQuery);
  }
})(this, function ($) {
  // ...
});
```

npm包示例: [react-table](https://cdn.jsdelivr.net/npm/react-table/), [antd](https://cdn.jsdelivr.net/npm/antd/)

## 总结

这三种模块方案大致如此，部分 npm package 也会同时打包出 commonjs/esm/umd 三种模块化格式，供不同需求的业务使用，比如 [antd](https://cdn.jsdelivr.net/npm/antd/)。

- [antd 的 cjs](https://cdn.jsdelivr.net/npm/antd@4.17.2/lib/index.js)
- [antd 的 umd](https://cdn.jsdelivr.net/npm/antd@4.17.2/dist/antd.js)
- [antd 的 esm](https://cdn.jsdelivr.net/npm/antd@4.17.2/es/index.js)
