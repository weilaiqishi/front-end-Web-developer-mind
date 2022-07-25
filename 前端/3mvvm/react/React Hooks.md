# React Hooks

原文 [「react进阶」一文吃透react-hooks原理](https://juejin.cn/post/6944863057000529933)

## 什么是hooks？

Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。
是函数组件**解决没有state，生命周期，逻辑不能复用**的一种技术方案

架构图
![react hooks 思维导图](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d99a12ad708647d4bfd075a59d518c8b~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

### function组件和class组件本质的区别

对于 `class` 组件，我们只需要实例化一次，实例中保存了组件的 `state` 等状态。对于每一次更新只需要调用 `render` 方法就可以。但是在 `function` 组件中，每一次更新都是一次新的函数执行,为了保存一些状态,执行一些副作用钩子, `react-hooks` 应运而生，去帮助记录组件的状态，处理一些额外的副作用。

## 引入hooks

### 当我们引入hooks时候发生了什么？

我们从引入 `hooks` 开始，以 `useState` 为例子，当我们从项目中这么写：

```js
import { useState } from 'react'
```

`useState` 在 `react/src/ReactHooks.js` 中

```js
export function useState(initialState){
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
```

`useState()` 的执行等于 `dispatcher.useState(initialState)` 这里面引入了一个 `dispatcher` ，我们看一下 `resolveDispatcher`

**resolveDispatcher**

```js
function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current
  return dispatcher
}
```

**ReactCurrentDispatcher**
`react/src/ReactCurrentDispatcher.js`

```js
const ReactCurrentDispatcher = {
  current: null,
};
```

我们看到 `ReactCurrentDispatcher.current` 初始化的时候为 `null` ，然后就没任何下文了。我们暂且只能把 **ReactCurrentDispatcher** 记下来。看看`ReactCurrentDispatcher` 什么时候用到的 ？

### 无状态组件的函数执行

想要彻底弄明白 `hooks`，就要从其根源开始，上述我们在引入 `hooks` 的时候，最后以一个 `ReactCurrentDispatcher` 草草收尾，线索全部断了，所以接下来我们只能从函数组件执行开始。

**renderWithHooks 执行函数**
`react-reconciler/src/ReactFiberBeginWork.js`

function组件初始化：

```js
renderWithHooks(
    null,                // current Fiber
    workInProgress,      // workInProgress Fiber
    Component,           // 函数组件本身
    props,               // props
    context,             // 上下文
    renderExpirationTime,// 渲染 ExpirationTime
);
```

对于初始化是没有 `current` 树的，之后完成一次组件更新后，会把当前 `workInProgress` 树赋值给 `current` 树。
function组件更新：

```js
renderWithHooks(
    current,
    workInProgress,
    render,
    nextProps,
    context,
    renderExpirationTime,
);
```

我们从上边可以看出来，`renderWithHooks` 函数作用是 **调用function组件函数** 的主要函数。我们重点看看 `renderWithHooks` 做了些什么？

**renderWithHooks**
`react-reconciler/src/ReactFiberHooks.js`

```js
export function renderWithHooks(
  current,
  workInProgress,
  Component,
  props,
  secondArg,
  nextRenderExpirationTime,
) {
  renderExpirationTime = nextRenderExpirationTime;
  currentlyRenderingFiber = workInProgress;

  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.expirationTime = NoWork;

  ReactCurrentDispatcher.current =
      current === null || current.memoizedState === null
        ? HooksDispatcherOnMount
        : HooksDispatcherOnUpdate;

  let children = Component(props, secondArg);

  if (workInProgress.expirationTime === renderExpirationTime) { 
       // ....这里的逻辑我们先放一放
  }

  ReactCurrentDispatcher.current = ContextOnlyDispatcher;

  renderExpirationTime = NoWork;
  currentlyRenderingFiber = null;

  currentHook = null
  workInProgressHook = null;

  didScheduleRenderPhaseUpdate = false;

  return children;
}
```

一些概念

- `current fiber树`: 当完成一次渲染之后，会产生一个 `current` 树, `current` 会在 `commit` 阶段替换成真实的 `Dom` 树。
- `workInProgress fiber树`: 即将调和渲染的 `fiber` 树。在一次新的组件更新过程中，会从 `current` 复制一份作为 `workInProgress` ,更新完毕后，将当前的 `workInProgress` 树赋值给 `current` 树。
- `workInProgress.memoizedState`: 在 `class` 组件中，`memoizedState` 存放 `state` 信息，在 `function` 组件中，**`memoizedState` 在一次调和渲染过程中，以链表的形式存放hooks信息**。
- `workInProgress.expirationTime`: `react` 用不同的 `expirationTime` ,来确定更新的优先级
- `currentHook` : 可以理解 `current树` 上的指向的当前调度的 `hooks` 节点。
- `workInProgressHook`: 可以理解 `workInProgress树` 上指向的当前调度的 `hooks` 节点。

**`renderWithHooks`函数主要作用**:

首先先置空即将调和渲染的 `workInProgress树` 的 `memoizedState` 和 `updateQueue`，为什么这么做，因为在接下来的函数组件执行过程中，要把新的 `hooks` 信息挂载到这两个属性上，然后在组件 `commit` 阶段，将 `workInProgress树` 替换成 `current树`，更新真实的DOM元素节点。并在 `current树` 保存 `hooks` 信息。

然后根据当前函数组件是否是第一次渲染，赋予 `ReactCurrentDispatcher.current` 不同的 `hooks` ,终于和上面讲到的ReactCurrentDispatcher联系到一起。对于第一次渲染组件，那么用的是 `HooksDispatcherOnMount hooks` 对象。

对于渲染后，需要更新的函数组件，则是 `HooksDispatcherOnUpdate` 对象，那么两个不同就是通过 `current树` 上是否 `memoizedState（hook信息）` 来判断的

接下来，**调用 `Component(props, secondArg)` 执行我们的函数组件，我们的函数组件在这里真正的被执行了，然后，我们写的hooks被依次执行，把hooks信息依次保存到workInProgress树上**。 至于它是怎么保存的，我们马上会讲到。

接下来，也很重要，将 `ContextOnlyDispatcher` 赋值给 `ReactCurrentDispatcher.current`，由于js是单线程的，也就是说我们没有在函数组件中，调用的hooks，都是`ContextOnlyDispatcher` 对象上hooks

```js
const ContextOnlyDispatcher = {
    useState:throwInvalidHookError
}
function throwInvalidHookError() {
  invariant(
    false,
    'Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' +
      ' one of the following reasons:\n' +
      '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' +
      '2. You might be breaking the Rules of Hooks\n' +
      '3. You might have more than one copy of React in the same app\n' +
      'See https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.',
  );
}
```

### 不同的hooks对象

**第一次渲染(这里只展示了常用的`hooks`)：**

```js
const HooksDispatcherOnMount = {
  useCallback: mountCallback,
  useEffect: mountEffect,
  useLayoutEffect: mountLayoutEffect,
  useMemo: mountMemo,
  useReducer: mountReducer,
  useRef: mountRef,
  useState: mountState,
};
```

**更新组件：**

```js
const HooksDispatcherOnUpdate = {
  useCallback: updateCallback,
  useEffect: updateEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: updateState
};
```

看来对于第一次渲染组件，和更新组件，`react-hooks` 采用了两套Api

我们用流程图来描述整个过程：
![React函数组件渲染流程图](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/adcbd09984f84d0d97a15df124e83c09~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)
