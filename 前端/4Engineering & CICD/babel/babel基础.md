# Babel基础

转载自[「前端基建」带你在Babel的世界中畅游](https://juejin.cn/post/7025237833543581732)

## Babel日常用法

### plugin 和 Preset

所谓 **`Preset` 就是一些 `Plugin` 组成的合集**,你可以将Preset理解称为就是一些的Plugin整合称为的一个包。

#### 常见Preset

`babel-preset-env`

`@babel/preset-env` 是一个智能预设，它可以将我们的高版本JavaScript代码进行转译根据内置的规则转译成为低版本的javascript代码。
`preset-env` 内部集成了绝大多数plugin（State > 3）的转译插件，它会根据对应的参数进行代码转译。
> 需要额外注意的是 `babel-preset-env` 仅仅针对语法阶段的转译，比如转译箭头函数，`const/let` 语法。针对一些Api或者ES6内置模块的 `polyfill` ，preset-env是无法进行转译的。这块内容我们会在之后的polyfill中为大家进行详细讲解。

`babel-preset-react`

通常我们在使用 `React` 中的 `jsx` 时，相信大家都明白实质上jsx最终会被编译称为 `React.createElement()` 方法。
`babel-preset-react` 这个预设起到的就是将jsx进行转译的作用。

`babel-preset-typescript`

对于TypeScript代码，我们有两种方式去 `编译TypeScript代码` 成为JavaScript代码。

1. 使用 `tsc` 命令，结合 `cli` 命令行参数方式或者 `tsconfig` 配置文件进行编译ts代码。
2. 使用 `babel` ，通过 `babel-preset-typescript` 代码进行编译ts代码。

#### 常见Plugin

Babel官网列举出了一份非常详尽的 [Plugin List](https://link.juejin.cn/?target=https%3A%2F%2Fbabeljs.io%2Fdocs%2Fen%2Fplugins-list)

![Plugin List](./img/bebal_plugins_list.jpg)

### 前端基建中的Babel配置详解

关于前端构建工具，无论使用的是 `webapack` 还是 `rollup` 又或是其他，内部都离不开 `Babel` 相关配置。

关于 `WebPack` 中我们日常使用的 `babel` 相关配置主要涉及以下三个相关插件:

- `babel-loader`
- `babel-core`
- `babel-preset-env`

#### babel-loader

`webpack` 中 `loader` 的本质就是一个函数，接受我们的源代码作为入参同时返回新的内容。所以 `babel-loader` 的本质就是一个函数，我们匹配到对应的 `jsx?/tsx?` 的文件交给 `babel-loader`:

```js
/**
 * 
 * @param sourceCode 源代码内容
 * @param options babel-loader相关参数
 * @returns 处理后的代码
 */
function babelLoader (sourceCode,options) {
  // ..
  return targetCode
}
```

> 关于 `options` ，`babel-loader` 支持直接通过 `loader` 的参数形式注入，同时也在loader函数内部通过读取 `.babelrc/babel.config.js/babel.config.json` 等文件注入配置。

#### babel-core

`babel-loader` 仅仅是识别匹配文件和接受对应参数的函数，那么 `babel` 在编译代码过程中核心的库就是 `@babel/core` 这个库。
`babel-core` 是 `babel` 最核心的一个编译库，他可以将我们的代码进行**词法分析--语法分析--语义分析**过程从而生成 `AST` 抽象语法树，从而对于“这棵树”的操作之后再通过编译称为新的代码。
`babel-core` 其实相当于 `@babel/parse` 和 `@babel/generator` 这两个包的合体
`babel-core` 通过 `transform` 方法将我们的代码进行编译。

关于 `babel-core` 中的编译方法其实有很多种，比如直接接受字符串形式的 `transform` 方法或者接受js文件路径的 `transformFile` 方法进行文件整体编译。
同时它还支持同步以及异步的方法，[文档](https://babeljs.io/docs/en/babel-core)

```js
const core = require('@babel/core')

/**
 * 
 * @param sourceCode 源代码内容
 * @param options babel-loader相关参数
 * @returns 处理后的代码
 */
function babelLoader (sourceCode,options) {
  // 通过transform方法编译传入的源代码
  core.transform(sourceCode)
  return targetCode
}
```

#### babel-preset-env

针对代码的转译我们需要告诉 **`babel`以什么样的规则进行转化** ，比如我需要告诉babel：“嘿，babel。将我的这段代码转化称为EcmaScript 5版本的内容！”。

```js
const core = require('@babel/core');

/**
 *
 * @param sourceCode 源代码内容
 * @param options babel-loader相关参数
 * @returns 处理后的代码
 */
function babelLoader(sourceCode, options) {
  // 通过transform方法编译传入的源代码
  core.transform(sourceCode, {
    presets: ['babel-preset-env'],
    plugins: [...]
  });
  return targetCode;
}
```

### `Babel` 相关 `polyfill` 内容

- 最新 `ES语法`，比如：箭头函数，let/const。
- 最新 `ES Api`，比如 `Promise`
- 最新 `ES实例/静态方法`，比如 `String.prototype.include`

`babel-prest-env` 仅仅只会转化最新的es语法，并不会转化对应的Api和实例方法，实现这部分内容的低版本代码实现需要一系列类似"垫片"的工具。

针对于 `polyfill` 方法的内容，babel中涉及两个方面来解决：

- `@babel/polyfill`
- `@babel/runtime`
- `@babel/plugin-transform-runtime`

第一种实现 `polyfill` 的方式：

通过 `@babel/polyfill` 通过往全局对象上添加属性以及直接修改内置对象的 `Prototype` 上添加方法实现 `polyfill` 。
比如说我们需要支持 `String.prototype.include`，在引入 `@babel/polyfill` 这个包之后，它会在全局 `String` 的原型对象上添加 `include`方法从而支持我们的Js Api。
我们说到这种方式本质上是往全局对象/内置对象上挂载属性，所以这种方式难免会造成全局污染。

**应用 `@babel/polyfill`**
在 `babel-preset-env` 中存在一个 `useBuiltIns` 参数，这个参数决定了如何在 `preset-env` 中使用 `@babel/polyfill` 。

```json
{
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": false
        }]
    ]
}
```

`useBuiltIns`--`"usage"`| `"entry"` | `false`

- false: 当我们使用 `preset-env` 传入 `useBuiltIns` 参数时候，默认为false。它表示仅仅会转化最新的ES语法，并不会转化任何Api和方法。
- entry: 当传入 `entry` 时，需要我们在项目入口文件中手动引入一次 `core-js`，它会根据我们配置的浏览器兼容性列表(`browserList`)然后 `全量引入` 不兼容的 `polyfill`。在 `Babel7.4.0` 之后，[@babel/polyfill](https://babeljs.io/docs/en/babel-polyfill) 被废弃它变成另外两个包的集成。`core-js/stable` `regenerator-runtime/runtime` ，但是他们的使用方式是一致的，只是在入口文件中引入的包不同了。[浏览器兼容性列表配置方式](https://github.com/browserslist/browserslist)。同时需要注意的是，在我们使用 `useBuiltIns:entry/usage` 时，需要额外指定 `core-js` 这个参数。默认为使用 `core-js 2.0`，所谓的 `core-js` 就是我们上文讲到的“垫片”的实现。它会实现一系列内置方法或者 `Promise等Api`。`core-js 2.0` 版本是跟随 `preset-env` 一起安装的，不需要单独安装。
- usage: 全量引入 `polyfill`，比如说我们代码中仅仅使用了 `Array.from` 这个方法，`polyfill` 并不仅仅会引入 `Array.from` ，同时也会引入 `Promise` 、`Array.prototype.include` 等其他并未使用到的方法。这就会造成包中引入的体积太大了。

```js
{
    "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": "usage",
            "core-js": 3
        }]
    ]
}
```

**关于 `usage` 和 `entry` 存在一个需要注意的本质上的区别**

以项目中引入 `Promise` 为例

当我们配置 `useBuintInts:entry` 时，仅仅会在入口文件全量引入一次`polyfill`

```js
// 当使用entry配置时
...
// 一系列实现polyfill的方法
global.Promise = promise

// 其他文件使用时
const a = new Promise()
```

而当我们使用 `useBuintIns:usage` 时，`preset-env` 只能基于各个模块去分析它们使用到的 `polyfill` 从而进入引入。`preset-env` 会帮助我们智能化的在需要的地方引入

```js
// a. js 中
import "core-js/modules/es.promise";

// b.js中
import "core-js/modules/es.promise";
```

- 在usage情况下，如果我们存在很多个模块，那么无疑会多出很多冗余代码( `import` 语法)。

- 同样在使用 `usage` 时因为是模块内部局部引入 `polyfill` 所以按需在模块内进行引入，而 `entry` 则会在代码入口中一次性引入。

## `Babel` 插件开发

通过 `babel` 插件可以带你在原理层面更加深入前端编译原理的知识内容。
可以实现类似 `element-plus` 中的按需引入方式，又或许对于 `lint` 你存在自己的特殊的规则。再不然对于一些js中特殊的写法的支持。

### `babel` 的编译

`webpack`、`lint`、`babel` 等等很多工具和库的核心都是通过 `抽象语法树（Abstract Syntax Tree，AST）` 这个概念来实现对代码的处理。

针对将代码转化为不同的AST你可以在 `astexplorer` 看到目前主流任何解析器的AST转化。

参考网站：

- [astexplorer](https://link.juejin.cn/?target=https%3A%2F%2Fastexplorer.net%2F)：这是一个在线的代码转译器，他可以按照目前业界主流的方式将任何代码转为AST。
- [babel-handbook](https://link.juejin.cn/?target=undefined)：babel插件开发中文手册文档。
- [the-super-tiny-compiler-cn](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fstarkwang%2Fthe-super-tiny-compiler-cn)：一个github上的开源小型listp风格转化js编译器，强烈推荐对编译原理感兴趣的同学可以去看一看它的代码。

#### `babel` 插件开发基础指南

插件开发通常会涉及这些库:

- `@babel/core`:上边我们说过 `babel/core` 是 `babel` 的核心库，核心的 `api` 都在这里。比如上边我们讲到的 `transform` ，`parse` 方法。
- `@babel/parser`:babel解析器。
- `@babel/types`: 这个模块包含手动构建 AST 和检查 AST 节点类型的方法(比如通过对应的api生成对应的节点)。
- `@babel/traverse`: 这个模块用于对AST的遍历，它维护了整棵树的状态(需要注意的是 `traverse` 对于ast是一种深度遍历)。
- `@babel/generator`: 这个模块用于代码的生成，通过AST生成新的代码返回。

#### `babel` 的工作流程

它的工作流程大概可以概括称为以下三个方面: 

- `Parse`（解析）阶段：这个阶段将我们的js代码(字符串)进行 `词法分析` 生成一系列 `tokens` ，之后再进行 `语法分析` 将 `tokens` 组合称为一颗`AST抽象语法树` 。(比如 `babel-parser` 它的作用就是这一步)
- `Transform`（转化）阶段：这个阶段 `babel` 通过对于这棵树的遍历，从而对于旧的 `AST` 进行增删改查，将新的js语法节点转化称为浏览器兼容的语法节点。( `babel/traverse` 就是在这一步进行遍历这棵树)
- `Generator`（生成）阶段：这个阶段babel会将新的AST转化同样进行深度遍历从而生成新的代码。( `@babel/generator` )

![babel的工作流程](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/787ab733a63c4314b6ce01b3812ba04f~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)

**`babel` 中 `AST` 的遍历过程**

- `babel` 中 `AST` 节点的遍历是基于一种 `访问者模式(Visitor)`，不同的访问者会执行不同的操作从而得到不同的结果。
- `visitor` 上挂载了以每个节点命名的方法，当进行 `AST` 遍历时就会触发匹配的方法名从而执行对应方法进行操作。

### 开发 `babel` 插件

以一个简单的 `ES6` 中的箭头函数转化为 `ES5` 方式入手
对应的插件是 `@babel/plugin-transform-arrow-functions`

**目标**

```js
// input
const arrowFunc = () => {
	console.log(this)
}

// output
var _this = this
funciton arrowFunc() {
    console.log(_this)
}
```

### `babel` 原版转化方式**

```js
/**
 * babel插件
 * 主要还是@babel/core中的transform、parse 对于ast的处理
 * 以及babel/types 中各种转化规则
 *
 * Ast是一种深度优先遍历
 * 内部使用访问者(visitor)模式
 *
 * babel主要也是做的AST的转化
 *
 * 1. 词法分析 tokens : var a  = 1 ["var","a","=","1"]
 * 2. 语法分析 将tokens按照固定规则生成AST语法树
 * 3. 语法树转化 在旧的语法树基础上进行增删改查 生成新的语法书
 * 4. 生成代码 根据新的Tree生成新的代码
 */

// babel核心转化库 包含core -》 AST -》 code的转化实现
/* 
  babel/core 其实就可以相当于 esprima+Estraverse+Escodegen
  它会将原本的sourceCode转化为AST语法树
  遍历老的语法树
  遍历老的语法树时候 会检查传入的插件/或者第三个参数中传入的`visitor`
  修改对应匹配的节点 
  生成新的语法树
  之后生成新的代码地址
*/
const babel = require('@babel/core');

// babel/types 工具库 该模块包含手动构建TS的方法，并检查AST节点的类型。(根据不同节点类型进行转化实现)
const babelTypes = require('@babel/types');

// 转化箭头函数的插件
const arrowFunction = require('@babel/plugin-transform-arrow-functions');


const sourceCode = `const arrowFunc = () => {
	console.log(this)
}`;

const targetCode = babel.transform(sourceCode, {
  plugins: [arrowFunction],
});

console.log(targetCode.code)
```

### 自己实现`@babel/plugin-transform-arrow-functions`插件

基础的结构

``` js
const babel = require('@babel/core');

// babel/types 工具库 该模块包含手动构建TS的方法，并检查AST节点的类型。(根据不同节点类型进行转化实现)
const babelTypes = require('@babel/types');

// 我们自己实现的转化插件
const { arrowFunctionPlugin } = require('./plugin-transform-arrow-functions');


const sourceCode = `const arrowFunc = () => {
	console.log(this)
}`;

const targetCode = babel.transform(sourceCode, {
  plugins: [arrowFunctionPlugin],
});
// 打印编译后代码
console.log(targetCode.code)
```

```js
// plugin-transform-arrow-functions.js
const arrowFunctionPlugin = () => {
    // ...
}
module.exports = {
    arrowFunctionPlugin
}
```

`babel` 插件实质上就是一个对象，里边会有一个属性 `visitor`。这个`visitor` 对象上会有很多方法，每个方法都是基于节点的名称去命名的。

当 `babel/core` 中的 `transform` 方法进行 `AST` 的遍历时会进入visitor对象中匹配，如果对应节点的类型匹配到了 `visitor` 上的属性那么就会从而执行相应的方法。

```js
const arrowFunctionPlugin = {
    visitor: {
      ArrowFunctionExpression(nodePath) {
          // do something
      }
    },
}
```

当进行 `AST` 遍历时，如果碰到节点类型为 `ArrowFunctionExpression` 时就会进入 `visitor` 对象中的 `ArrowFunctionExpression` 方法从而执行对应逻辑从而进行操作当前树。

我如何知道每个 `节点的类型` 呢？比如 `ArrowFunctionExpression` 就是箭头函数的类型。
[babel/types](https://link.juejin.cn/?target=https%3A%2F%2Fbabeljs.io%2Fdocs%2Fen%2Fbabel-types)中涵盖了所有的节点类型。我们可以通过查阅babel/types查阅对应的节点类型。
当然还存在另一个更加方便的方式，上边我们提到的[astexplorer](https://link.juejin.cn/?target=https%3A%2F%2Fastexplorer.net%2F)，你可以在这里查阅对应代码生成的AST从而获得对应的节点。

什么是 `nodePath` 参数，它有什么作用？
`nodePath` 参数你可以将它理解成为一个节点路径。它包含了这个树上这个节点分叉的所有信息和对应的 `api`。[关于路径的文档](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fjamiebuilds%2Fbabel-handbook%2Fblob%2Fmaster%2Ftranslations%2Fzh-Hans%2Fplugin-handbook.md)

**`arrowFunctionPlugin`实现思路**

- 首先，我们可以通过 [astexplorer](https://link.juejin.cn/?target=https%3A%2F%2Fastexplorer.net%2F) 分别输入我们的源代码和期望的编译后代码得到对应的AST结构。
- 之后，我们在对比这两棵树的结构从而在原有的AST基础上进行修改得到我们最终的AST。
- 剩下，应该就没有什么剩下的步骤了。`babel transform` 方法会根据我们修改后的AST生成对应的源代码。

需要编译的箭头函数部分节点截图：
![需要编译的箭头函数部分节点](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10378813007b4d23ad1851966c4ca907~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)

编译后代码的部分节点截图：
![编译后代码的部分节点](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65f72a21370e48b3a7add51a3e728b7e~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)

对比 `input` 和 `output` :

- `output` 中将箭头函数的节点 `ArrowFunctionExpression` 替换成为了FunctionDeclaration。
- `output` 中针对箭头函数的 `body``，调用表达式声明ExpressionStatement` 时，传入的 `arguments` 从 `ThisExpression` 更换成了 `Identifier` 。
- 同时 `output` 在箭头函数同作用域内额外添加了一个变量声明，`const _this = this` 。

实现功能

```js
const babelTypes = require('@babel/types');

function ArrowFunctionExpression(path) {
  const node = path.node;
  hoistFunctionEnvironment(path);
  node.type = 'FunctionDeclaration';
}

/**
 *
 *
 * @param {*} nodePath 当前节点路径
 */
function hoistFunctionEnvironment(nodePath) {
  // 往上查找 直到找到最近顶部非箭头函数的this p.isFunction() && !p.isArrowFunctionExpression()
  // 或者找到跟节点 p.isProgram()
  const thisEnvFn = nodePath.findParent((p) => {
    return (p.isFunction() && !p.isArrowFunctionExpression()) || p.isProgram();
  });
  // 接下来查找当前作用域中那些地方用到了this的节点路径
  const thisPaths = getScopeInfoInformation(thisEnvFn);
  const thisBindingsName = generateBindName(thisEnvFn);
  // thisEnvFn中添加一个变量 变量名为 thisBindingsName 变量值为 this
  // 相当于 const _this = this
  thisEnvFn.scope.push({
    // 调用babelTypes中生成对应节点
    // 详细你可以在这里查阅到 https://babeljs.io/docs/en/babel-types
    id: babelTypes.Identifier(thisBindingsName),
    init: babelTypes.thisExpression(),
  });
  thisPaths.forEach((thisPath) => {
    // 将this替换称为_this
    const replaceNode = babelTypes.Identifier(thisBindingsName);
    thisPath.replaceWith(replaceNode);
  });
}

/**
 *
 * 查找当前作用域内this使用的地方
 * @param {*} nodePath 节点路径
 */
function getScopeInfoInformation(nodePath) {
  const thisPaths = [];
  // 调用nodePath中的traverse方法进行便利
  // 你可以在这里查阅到  https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md
  nodePath.traverse({
    // 深度遍历节点路径 找到内部this语句
    ThisExpression(thisPath) {
      thisPaths.push(thisPath);
    },
  });
  return thisPaths;
}

/**
 * 判断之前是否存在 _this 这里简单处理下
 * 直接返回固定的值
 * @param {*} path 节点路径
 * @returns
 */
function generateBindName(path, name = '_this', n = '') {
  if (path.scope.hasBinding(name)) {
    generateBindName(path, '_this' + n, parseInt(n) + 1);
  }
  return name;
}

module.exports = {
  hoistFunctionEnvironment,
  arrowFunctionPlugin: {
    visitor: {
      ArrowFunctionExpression,
    },
  },
};
```

使用我们写好的插件来 `run` 一下
![使用babel自定义箭头函数转换插件](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/857ebd263a2a451c89efa447169cbdce~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)

