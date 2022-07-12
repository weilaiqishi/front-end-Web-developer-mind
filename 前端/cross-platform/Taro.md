# Taro

## 参考资料

- [小程序跨框架开发的探索与实践](https://mp.weixin.qq.com/s?__biz=MzU3NDkzMTI3MA==&mid=2247483770&idx=1&sn=ba2cdea5256e1c4e7bb513aa4c837834)
- [Taro3跨端跨框架原理初探](https://juejin.cn/post/6989968343163731981)
- [掘金 关于Taro框架的几个面试点](https://juejin.cn/post/6844904080649928712)
- [掘金 小程序开发：用原生还是选框架（wepy/mpvue/uni-app/Taro）](https://juejin.cn/post/6844903862504013832)

## 背景

在微信小程序之后，各大厂商纷纷发布了自己的小程序平台，比如：支付宝、百度、头条、QQ 等，再加上快应用、网易、360、京东等，小程序的赛道越来越拥挤，开发人员需要适配的小程序平台越来越多，因此，各大小程序开发框架也纷纷进行了多端适配。

小程序的开发框架主要的区别和重心在于：`DSL` 以及 `多端适配`。

### 小程序跨框架开发的探索

微信小程序主要分为 `逻辑层` 和 `视图层`，以及在他们之下的原生部分。逻辑层主要负责 JS 运行，视图层主要负责页面的渲染，它们之间主要通过 `Event` 和 `Data` 进行通信，同时通过 `JSBridge` 调用原生的 API。这也是以微信小程序为首的大多数小程序的架构。
由于原生部分对于前端开发者来说就像是一个黑盒，因此，整个架构图的原生部分可以省略。

![小程序架构](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSrWZxBKFFDGY0FOkdo4uL6MefKXFhG2lLu0CU8HfibNcG8Fbhj32nLGog/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

## Taro3跨端跨框架原理

### Taro3之前（重编译时，轻运行时）

**架构缺点**
![Taro2架构缺点](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSrsqiagXnA4wiatuf0Hjq5T6WZ2ZnFMibBkycgicY4tdJumibicXe3vGESibqJQ/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

- `错误栈`复杂，且无 SourceMap
- 和 React `DSL` 强绑定
- React `新特性` 需要手动对接
- `JSX 适配` 工作量大，限制多。
- `前端生态` 无法直接复用
- 代码复杂，`社区贡献`困难

**架构实现**
![Taro12架构图](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSreyxqaROsxcDtFicficXicpA7PTCtIOldfzzicjjaM6cT8c7tmfUvMdrIyw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

- `编译时`: 主要是将 Taro 代码通过 `Babel` 转换成 小程序的代码，如：JS、WXML、WXSS、JSON。编译时使用 `babel-parser` 将 Taro 代码解析成抽象语法树，然后通过 `babel-types` 对抽象语法树进行一系列修改、转换操作，最后再通过 `babel-generate` 生成对应的目标代码。
- `运行时`: 主要是进行一些：生命周期、事件、data 等部分的处理和对接。在代码编译之后实际运行时，和 React 并没有关系。

整个编译时最复杂的部分在于 JSX 编译。
我们都知道 JSX 是一个 JavaScript 的语法扩展，它的写法千变万化，十分灵活。Taro 是采用 `穷举` 的方式对 JSX 可能的写法进行了一一适配，这一部分工作量很大，但尽管如此，也不可能完全覆盖所有的情况，这一块Taro团队内部一直有个梗：如果你使用 Taro 开发感觉 Bug 少，那说明你的 React 代码写得很规范。
![穷举JSX](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSrvibZOblVuMqnI82b5nFU025eLMZWFNK70cTKqNdTOlXiaS972eITicQbA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

![Taro2架构特点](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSrwL9Vl5UFrZzQhR85l2ibqXWKRDBs1N0YwH0ncFrWAuKQj2kIjzm11jA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

### mpvue的启发

`mpvue` 是半编译时，半运行时。编译时做的事情和 Taro 很类似：将 Vue SFC 写法的代码编译成 小程序代码文件（JS、WXML、WXSS、JSON）。运行时和 Vue 的运行时是强关联的，将 `patch` 阶段的 DOM 操作相关方法置空，也就是什么都不做。其次，在创建 Vue 实例的同时，还会偷偷的调用 `Page()` 用于生成了小程序的 page 实例。然后 运行时的 patch 阶段会直接调用 `$updateDataToMp()` 方法，这个方法会获取挂在在 page 实例上维护的数据 ，然后通过 `setData` 方法更新到视图层。不同于 Taro 运行时和 React 无关，mpvue 本质上还是将 Vue 运行在了小程序，且整个框架基于 Webpack 实现了较为完善的工程化。

![mpvue架构图](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSrPaYaq5ia2Te2AicR0RY1iaY8x2o8yG9dHn8VHHpsIlgdLTjGHVupR11ZA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

### Taro3之后（重运行时）

#### taro-runtime

无论开发这是用的是什么框架，React 也好，Vue 也罢，最终代码经过运行之后都是调用了浏览器的那几个 BOM/DOM 的 API ，如：`createElement`、`appendChild`、`removeChild` 等。`taro-runtime` 这个包实现了 一套 高效、精简版的 `DOM/BOM API`
![taro-runtime UML](https://mmbiz.qpic.cn/mmbiz_png/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSrpkksJmbujYkT9PgjBoTT0XI0MJ5AlDK6biaBaP0yr7JGE46iacv3rWPQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### React处理

在 `DOM/BOM` 注入之后，理论上来说，Nerv/Preact 就可以直接运行了。但是 React 有点特殊，因为 `React-DOM` 包含大量浏览器兼容类的代码，导致包太大，而这部分代码我们是不需要的，因此我们需要做一些定制和优化。Taro3使用 `taro-react` 用来连接 `react-reconciler` 和 `taro-runtime` 的 BOM/DOM API
![taro-react](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSr5CGqu9D0z5kg2twZfXGDOSYQKibn1uXQXe7nKa29Ab2A2WEmhNzsQDA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

具体的实现主要分为两步：

实现 `react-reconciler` 的 `hostConfig` 配置，即在 `hostConfig` 的方法中调用对应的 Taro BOM/DOM 的 API。
实现 render 函数（类似于 `ReactDOM.render`）方法，可以看成是创建 `Taro DOM Tree` 的容器。
![taro-react](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSr7vqImouqdlWFLncuiaho5dVIRGcPQjqiaicytd9h6uGAYPTicL1ibs46Tew/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

经过上面的步骤，React 代码实际上就可以在小程序的运行时正常运行了，并且会生成 `Taro DOM Tree`，那么偌大的 Taro DOM Tree 怎样更新到页面呢？

#### 渲染到小程序

首先将小程序的所有组件挨个进行模版化处理，然后**基于组件的 `template`，动态 “递归” 渲染整棵树**。
具体流程为先去遍历 `Taro DOM Tree` 根节点的子元素，再根据每个子元素的类型选择对应的模板来渲染子元素，然后在每个模板中我们又会去遍历当前元素的子元素，以此把整个节点树递归遍历出来。
![Taro3 React 实现流程](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSrRzoyQib4nMyXGlGLPEy3iccXayMybexO0x0ibTV5giaicgicn4tqCoa11A9g/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

**事件**
Taro Next 事件，具体的实现方式如下：

1. 在 小程序组件的模版化过程中，将所有事件方法全部指定为 调用 `ev` 函数，如：bindtap、bindchange、bindsubmit 等。
2. 在 运行时实现 `eventHandler` 函数，和 eh 方法绑定，收集所有的小程序事件
3. 通过 `document.getElementById()` 方法获取触发事件对应的 `TaroNode`
4. 通过 `createEvent()` 创建符合规范的 `TaroEvent`
5. 调用 `TaroNode.dispatchEvent` 重新触发事件

![Taro3 事件](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSrO7pGekYSK4A32xDyD62ibXDWUq3oU8ibMrSJ70LdkgRcEgF22BvBpaxw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

**基于 Taro DOM 实现了一套自己的事件机制**，这样做的好处之一是，无论小程序是否支持事件的冒泡与捕获，Taro 都能支持。

**更新**
无论是 React 还是 Vue ，最终都会调用 Taro DOM 方法，如：`appendChild`、`insertChild` 等。

这些方法在修改 Taro DOM Tree 的同时，还会调用 `enqueueUpdate` 方法，这个方法能获取到每一个 DOM 方法最终修改的节点路径和值，如：`{root.cn.[0].cn.[4].value: "1"}`，并通过 `setData` 方法更新到视图层。**更新的粒度是 DOM 级别**，只有最终发生改变的 DOM 才会被更新过去，相对于之前 data 级别的更新会更加精准，性能更好。
![Taro3 页面更新](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSribBOpxoeXuX7jwGAt70HxW2CCBKQGBlbHJ1sI9OtEeO9xvwcxb4ZHkA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

#### 新架构特点

新的架构基本解决了之前的遗留问题：

- `无 DSL 限制`：无论是你们团队是 React 还是 Vue 技术栈，都能够使用 Taro 开发
- `模版动态构建`：和之前模版通过编译生成的不同，Taro Next 的模版是固定的，然后基于组件的 template，动态 “递归” 渲染整棵 Taro DOM 树。
- `新特性无缝支持`：由于 Taro Next 本质上是将 React/Vue 运行在小程序上，因此，各种新特性也就无缝支持了。
- `社区贡献更简单`：错误栈将和 React/Vue 一致，团队只需要维护核心的 taro-runtime。
- `基于 Webpack`：Taro Next 基于 Webpack 实现了多端的工程化，提供了插件功能。

#### 性能优化

等条件下，编译时做的工作越多，也就意味着运行时做的工作越少，性能会更好。Taro Next 的新架构变成 近乎全运行 之后，花了很多精力在性能优化上面。

![Taro与原生小程序性能对比](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSr0kPGA5uY5WQERU5WUZ6gpTBibJB6gfWaeYFy0KpSQENlGTvyw0ibXVibg/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

Taro Next 多了红色部分的带来的性能隐患，如：引入 React/Vue 带来的 包的 Size 增加，运行时的损耗、Taro DOM Tree 的构建和更新、DOM data 初始化和更新。

而我们真正能做的，只有绿色部分，也就是：**Taro DOM Tree 的构建和更新、DOM data 初始化和更新**。

**Size**
引入 React/Vue 后，包大小在 Gzip 情况下大概增加了 30k 左右。
![size](https://mmbiz.qpic.cn/mmbiz_jpg/VicflqIDTUVVWoQKnZN53dyPkAkHC2gSrOIhOcRsjRzaZIic8ibQxQfc5Ky0fVDuFL7icQfNJLaJMxpC0mIoRwRSbw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

**DOM Tree**
Github 上有一个仓库 `jsdom`，基本上是在 Node.js 上实现了一套 Web 标准的 DOM/BOM ，这个仓库的代码在压缩前大概有 2.1M，而 Taro Next 的核心的 DOM/BOM API 代码才 1000 行不到。

**Update Date**
**Data 粒度更新实际上是有冗余的，并不是所有的 Data 的改变最后都会引起 DOM 的更新**，Taro Next 的更新是 DOM 级别的。其次，Taro 在更新的时候将 Taro DOM Tree 的 `path` 进行压缩，这点也极大的提升了性能。

## taro-cli

[Taro 技术揭秘：taro-cli](https://juejin.cn/post/6844903633557913608)

## Taro框架开发相比原生开发有哪些不同

小程序原生的开发方式不够工程化
1.原生开发对Node、预编译器、webpack支持不好，影响开发效率和工程构建流程
2.微信定义了一个不伦不类的语法，不如正经学vue、react，学会了全端通用，而不是只为微信小程序
3.vue/react生态里有太多周边工具，可以提高开发效率，比如ide、校验器、三方库。。。
4.微信那个ide和专业编辑器相比实在不好用
> 一个小程序页面或组件，需要同时包含 4 个文件，以至开发一个功能模块时，需要多个文件间来回切换
> 没有自定义文件预处理，无法直接使用 Sass、Less 以及较新的 ES Next 语法
> 字符串模板太过孱弱，小程序的字符串模板仿的是 Vue，但是没有提供 Vue 那么多的语法糖，当实现一些比较复杂的处理时，写起来就非常麻烦，虽然提供了 wxs 作为补充，但是使用体验还是非常糟糕

## 小程序开发框架对比

### 1.多端支持

Taro：支持微信的所有原生组件和api，无限制。同时框架封装了自己的跨端API，使用方式类似`Taro.request()`，支持Taro 代码与小程序代码混写，可通过混写的方式调用框架尚未封装的小程序新增API。
uni-app：支持微信的所有原生组件和api，无限制。在跨端方面，即便仍然使用微信原生的组件和API，也可以直接跨端编译到App、H5、以及支付宝百度头条等小程序。但为了管理清晰，推荐使用uni封装的API，类似`uni.request()`。同时支持条件编译，可在条件编译代码块中，随意调用各个平台新增的API及组件
mpvue：支持微信的所有原生组件和api，无限制。同时框架封装了自己的跨端API，使用方式类似 `mpvue.request()`
wepy：未对小程序API作二次封装，API依然使用微信原生的，框架与微信小程序是否新增API无关

Taro和uni-app在小程序端支持都不错，Taro发布移动端使用React Native，uni-app发布app端更容易也更多坑点
跨端支持度： `uni-app`,`Taro` > `mpvue` > `原生微信小程序`、`wepy`

### 2.性能

setData回调函数开头可认为是页面渲染完成的时间

长列表加载，从页面空列表开始，每隔1秒触发一次上拉加载（新增20条微博），记录单次耗时，触发20次后停止（页面达到400条微博）
结果微信原生在这20次 `触发上拉 -> 渲染完成` 的平均耗时为876毫秒，最快的uni-app是741毫秒，最慢的mpvue是4493毫秒
微信原生框架耗时主要在setData调用上，开发者若不单独优化，则每次都会传递大量数据；
而 uni-app、Taro 都在调用setData之前自动做diff计算，每次仅传递变动的数据。

长列表中的点赞组件响应速度，点赞按钮 onclick函数开头开始计时，setData回调函数开头结束计时
组件数据更新性能测评：微信原生开发,uni-app,Taro > wepy > mpvue

性能结论：`微信原生开发手工优化`,`uni-app`>`微信原生开发未手工优化`,`Taro` > `wepy` > `mpvue`

### 3.开发体验

React系用Taro，Vue系用uni-app
DSL语法支持：`Taro`,`uni-app` > `mpvue` > `wepy` > `微信原生`

## 使用过程遇到什么问题，怎么处理的

- 打包速度优化。使用 `thread-loader` 加速 babel 处理，使用 `cache-loader` 缓存 scss 编译结果。使用Taro最新版本3.5，升级到了 `webpack5`，只要缓存系统更好了。对大体积依赖包（如 `threejs`）进行 `splitChunks`，用到的页面用 `addChunkPages` 配置，达到按需加载效果，同时小程序编辑器刷新更快。
- 升级Taro最新版本3.5，遇到编译h5失败问题 <https://github.com/NervJS/taro/issues/11872>
- 淘宝小程序部分组件不兼容 <https://github.com/NervJS/taro/pull/12051>

