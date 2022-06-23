# 简述 npm script 的生命周期

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

在 npm 中，使用 `npm scripts` 可以组织整个前端工程的工具链。

```json
{
  "start": "serve ./dist",
  "build": "webpack",
  "lint": "eslint"
}
```

除了可自定义 `npm script` 外，npm 附带许多内置 scripts，他们无需带 `npm run`，可直接通过 `npm <script>` 执行

```sh
$ npm install
$ npm test
$ npm publish
```

我们在实际工作中会遇到以下几个问题：

1. 在某个 npm 库安装结束后，自动执行操作如何处理？
2. npm publish 发布 npm 库时将发布打包后文件，如果遗漏了打包过程如何处理，如何在发布前自动打包？

这就要涉及到一个 npm script 的生命周期

## 一个 npm script 的生命周期

当我们执行任意 `npm run` 脚本时，将自动触发 `pre/post` 的生命周期。

当手动执行 `npm run abc` 时，将在此之前自动执行 `npm run preabc`，在此之后自动执行 `npm run postabc`。

```sh
// 自动执行
npm run preabc

npm run abc

// 自动执行
npm run postabc
```

`patch-package` 一般会放到 `postinstall` 中。

```json
{
  "postinstall": "patch-package"
}
```

而发包的生命周期更为复杂，当执行 `npm publish`，将自动执行以下脚本。

- prepublishOnly: 最重要的一个生命周期。
- prepack
- prepare
- postpack
- publish
- postpublish

当然你无需完全记住所有的生命周期，如果你需要在发包之前自动做一些事情，如测试、构建等，请在 `prepulishOnly` 中完成。

```json
{
  "prepublishOnly": "npm run test && npm run build"
}
```

## 一个最常用的生命周期

`prepare`

`npm install` 之后自动执行
`npm publish` 之前自动执行
比如 `husky`

```json
{
  "prepare": "husky install"
}
```

## npm script 钩子的风险

假设某一个第三方库的 `npm postinstall` 为 `rm -rf /`，那岂不是又很大的风险?

```json
{
  "postinstall": "rm -rf /"
}
```

实际上，确实有很多 npm package 被攻击后，就是通过 `npm postinstall` 自动执行一些事，比如挖矿等。

如果 npm 可以限制某些库的某些 hooks 执行，则可以解决这个问题。
