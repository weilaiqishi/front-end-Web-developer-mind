---
title: Getting Started
description: Learn how to bundle a JavaScript application with webpack 5.
---

Webpack is used to compile JavaScript modules.
webpack 用于编译 JavaScript 模块。

## Basic Setup

Throughout the Guides we will use **`diff`** blocks to show you what changes we're making to directories, files, and code. For instance:
在整个指南中，我们将使用 diff 块，来展示对目录、文件和代码所做的修改。例如：

```diff
+ this is a new line you shall copy into your code
- and this is a line to be removed from your code
  and this is a line not to touch.
```

We also need to adjust our `package.json` file in order to make sure we mark our package as `private`, as well as removing the `main` entry. This is to prevent an accidental publish of your code.
我们还需要调整 package.json 文件，以便确保我们安装包是 private(私有的)，并且移除 main 入口。这可以防止意外发布你的代码。

T> If you want to learn more about the inner workings of `package.json`, then we recommend reading the [npm documentation](https://docs.npmjs.com/files/package.json).
如果你想要了解 package.json 内在机制的更多信息，我们推荐阅读 npm 文档。

In this example, there are implicit dependencies between the `<script>` tags. Our `index.js` file depends on `lodash` being included in the page before it runs. This is because `index.js` never explicitly declared a need for `lodash`; it assumes that the global variable `_` exists.
在此示例中，`<script>` 标签之间存在隐式依赖关系。在 index.js 文件执行之前，还需要在页面中先引入 lodash。这是因为 index.js 并未显式声明它需要 lodash，假定推测已经存在一个全局变量 _。

There are problems with managing JavaScript projects this way:

- It is not immediately apparent that the script depends on an external library.
- If a dependency is missing, or included in the wrong order, the application will not function properly.
- If a dependency is included but not used, the browser will be forced to download unnecessary code.

Let's use webpack to manage these scripts instead.

使用这种方式去管理 JavaScript 项目会有一些问题：
无法直接体现，脚本的执行依赖于外部库。
如果依赖不存在，或者引入顺序错误，应用程序将无法正常运行。
如果依赖被引入但是并没有使用，浏览器将被迫下载无用代码。
让我们使用 webpack 来管理这些脚本。

## Creating a Bundle

The "distribution" code is the minimized and optimized `output` of our build process that will eventually be loaded in the browser.
分发代码是指在构建过程中，经过最小化和优化后产生的输出结果，最终将在浏览器中加载。

T> When installing a package that will be bundled into your production bundle, you should use `npm install --save`. If you're installing a package for development purposes (e.g. a linter, testing libraries, etc.) then you should use `npm install --save-dev`. More information can be found in the [npm documentation](https://docs.npmjs.com/cli/install).
在安装一个 package，而此 package 要打包到生产环境 bundle 中时，你应该使用 npm install --save。如果你在安装一个用于开发环境的 package 时（例如，linter, 测试库等），你应该使用 npm install --save-dev。更多信息请查看 npm 文档。

## Modules

The [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) and [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) statements have been standardized in [ES2015](https://babeljs.io/docs/en/learn/). They are supported in most of the browsers at this moment, however there are some browsers that don't recognize the new syntax. But don't worry, webpack does support them out of the box.

Behind the scenes, webpack actually "**transpiles**" the code so that older browsers can also run it. 

ES2015 中的 import 和 export 语句已经被标准化。虽然大多数浏览器还无法支持它们，但是 webpack 却能够提供开箱即用般的支持。

事实上，webpack 在幕后会将代码 “转译”，以便旧版本浏览器可以执行

## Using a Configuration

A configuration file allows far more flexibility than CLI usage. We can specify loader rules, plugins, resolve options and many other enhancements this way. See the [configuration documentation](/configuration) to learn more.
比起 CLI 这种简单直接的使用方式，配置文件具有更多的灵活性。我们可以通过配置方式指定 loader 规则(loader rule)、plugin(插件)、resolve 选项，以及许多其他增强功能。更多详细信息请查看 配置文档。

## NPM Scripts

Note that within `scripts` we can reference locally installed npm packages by name the same way we did with `npx`. This convention is the standard in most npm-based projects because it allows all contributors to use the same set of common scripts.
现在，可以使用 npm run build 命令，来替代我们之前使用的 npx 命令。注意，使用 npm scripts，我们可以像使用 npx 那样通过模块名引用本地安装的 npm packages。这是大多数基于 npm 的项目遵循的标准，因为它允许所有贡献者使用同一组通用脚本。