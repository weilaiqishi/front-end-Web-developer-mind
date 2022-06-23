# 打包器(webpack、rollup) 如何加载 json、image 等非 Javascript 资源

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

当 webpack 在这类打包器中，需要加载 JSON 等非 Javascript 资源时，则通过模块加载器(loader)将它们转化为模块的形式。

`json-loader` 的示例

```js
module.exports = function (source) {
  const json = typeof source === "string" ? source : JSON.stringify(source);
  return `module.exports = ${json}`;
};
```

图片处理更简单，替换为它自身的路径

```js
export default `$PUBLIC_URL/assets/image/main.png`;
```

那如何加载一个 CSS 脚本呢？此处涉及到各种 DOM API，以及如何将它抽成一个 .css 文件，复杂很多

## 打包器(webpack/rollup) 如何加载 style 样式资源

在 webpack 中，处理 css 稍微比较费劲，需要借用两个 loader 来做成这件事情:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
```

- `css-loader`: 处理 CSS 中的 url 与 @import，并将其视为模块引入，此处是通过 `postcss` 来解析处理，postcss 对于工程化中 css 处理的影响力可见一斑。
- `style-loader`: 将样式注入到 DOM 中

### 原理

如果说现代前端中 Javascript 与 CSS 是其中最重要的两种资源，那么 `Babel` 与 `PostCSS` 就是前端工程化中最有影响力的两个编译器。

`css-loader` 的原理就是 postcss，借用 `postcss-value-parser` 解析 CSS 为 AST，并将 CSS 中的 `url()` 与 `@import` 解析为模块。

`style-loader` 用以将 CSS 注入到 DOM 中，原理为使用 DOM API 手动构建 `style` 标签，并将 CSS 内容注入到 `style` 中。

`style-loader` 最简单实现

```js
module.exports = function (source) {
  return `
function injectCss(css) {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode(css))
  document.head.appendChild(style)
}

injectCss(\`${source}\`)
  `;
};
```

使用 DOM API 加载 CSS 资源，由于 CSS 需要在 JS 资源加载完后通过 DOM API 控制加载，容易出现页面抖动，在线上低效且性能低下。且对于 SSR 极度不友好。

由于性能需要，在线上通常需要单独加载 CSS 资源，这要求打包器能够将 CSS 打包，此时需要借助于 `mini-css-extract-plugin`将 CSS 单独抽离出来。
