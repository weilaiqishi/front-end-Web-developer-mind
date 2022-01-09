# Vue面试题

## 前言

Vue相关知识分原理和开发实战，本文主要是copy网上的答案，整理一下来应付面试

## Vue原理

先上一张知识图谱

![Vue3源码知识图谱 花果山大圣](https://topfullstackkimeng.oss-cn-hangzhou.aliyuncs.com/md/vue/vue3%E6%BA%90%E7%A0%81%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1%20%E8%8A%B1%E6%9E%9C%E5%B1%B1%E5%A4%A7%E5%9C%A3.png)

Vue原理大致有 运行时（数据驱动）、编译模块、响应式系统

### 响应式系统

#### 响应式数据的原理

流程

1.由于 Vue 执行一个组件的 `render` 函数是由 `Watcher` 去代理执行的，`Watcher` 在执行前会把 `Watcher` 自身先赋值给 `Dep.target` 这个全局变量，等待响应式属性去收集它
2.这样在哪个组件执行 `render` 函数时访问了响应式属性，响应式属性就会精确的收集到当前全局存在的 `Dep.target` 作为自身的依赖
3.在响应式属性发生更新时通知 `Watcher` 去重新调用 `vm._update(vm._render())`进行组件的视图更新

#### computed和watch有什么区别



#### 异步渲染与nextTick实现原理

nextTick实现原理

1.先去 嗅探环境，依次去检测
`Promise的then` -> `MutationObserver的回调函数` -> `setImmediate` -> `setTimeout` 是否存在，找到存在的就使用它，以此来确定回调函数队列是以哪个 api 来异步执行。
2.在 `nextTick` 函数接受到一个 `callback` 函数的时候，先不去调用它，而是把它 push 到一个全局的 `queue` 队列中，等待下一个任务队列的时候再一次性的把这个 `queue` 里的函数依次执行。
这个队列可能是 `microTask` 微任务队列，也可能是 `macroTask` 队列，前两个 api (`Promise的then`、`MutationObserver的回调函数`)属于微任务队列，后两个 api (`setImmediate`、`setTimeout`)属于宏任务队列。

[简化实现一个异步合并任务队列](https://juejin.cn/post/6844904118704668685#heading-2)

### 运行时

#### 虚拟dom 与 diff算法

##### diff

React 和 Vue 都只会对 tag 相同的同级节点进行 diff，如果不同则直接销毁重建，都是 O(n) 的复杂度。

##### key的作用

##### 理念杂谈

> 开发者不操作dom对象，和双向绑定没太大关系。React不提供双向绑定，开发者照样不需要操作dom。双向绑定只是一种语法糖，在表单元素上绑定 `value` 并且监听 `onChange` 事件去修改 `value` 触发响应式更新。
> 想看模板被编译后的原理的同学，可以去尤大开源的[vue-template-explorer](https://template-explorer.vuejs.org) 网站输入对应的模板，就会展示出对应的 render 函数。
> Vue 与 React 性能快慢问题，在初始化数据量不同的场景是不好比较的，React 不需要对数据递归的进行 `响应式定义`。而在更新的场景下 Vue 可能更快一些，因为 Vue 的更新粒度是组件级别的，而 React 是递归向下的进行 `reconcile` ，React 引入了 `Fiber` 架构和异步更新，目的也是为了让这个工作可以分在不同的 `时间片` 中进行，不要去阻塞用户高优先级的操作。
> Object.defineProperty的缺点：可以监控到数组下标的变化，[尤大说只是为了性能的权衡才不去监听](https://segmentfault.com/a/1190000015783546)。

## Vue开发

### 组件

Vue 组件的三个API: `prop`、`event`、`slot`

#### 组件中的data为什么是函数

如果组件里 data 直接写了一个对象的话，那么如果你在模板中多次声明这个组件，组件中的 data 会指向同一个引用。
此时如果在某个组件中对 data 进行修改，会导致其他组件里的 data 也被污染。 而如果使用函数的话，每个组件里的 data 会有单独的引用，这个问题就可以避免了。

#### 插槽

跟 DOM 没关系，是在虚拟节点树的插槽位置替换。

## 参考资料

> 1. 极客时间 玩转 Vue 3 全家桶
>    <https://time.geekbang.org/column/intro/100094401?tab=catalog>
> 2. 掘金 一张思维导图辅助你深入了解 Vue | Vue-Router | Vuex 源码架构
>    <https://juejin.cn/post/6844903842375532557#comment>
> 3. 掘金 驳《前端常见的Vue面试题目汇总》
>    <https://juejin.cn/post/6844904118704668685>
