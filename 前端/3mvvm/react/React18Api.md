# React18Api

[「React 深入」一文吃透React v18全部Api](https://juejin.cn/post/7124486630483689485)

图谱
![React Api 图谱]([image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/562c26a1f2394bd1a27c38cba266b848~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?))

## 组件类

### Component

在React中提供两种形式，一种是 `类组件` ，另一种是 `函数式组件` ，而在 `类组件` 组件中需要使用 `Component` 继承

### PureComponent

`PureComponent`：会对 `props` 和 `state` 进行浅比较，跳过不必要的更新，提高组件性能。
可以说 `PureComponent` 和 `Component` 基本完全一致，但 `PureComponent` 会浅比较，也就是较少 `render` 渲染的次数，所以 `PureComponent` 一般用于性能优化

在生命周期中有一个 `shouldComponentUpdate()` 函数，那么它能改变 `PureComponent` 吗？
其实是可以的，`shouldComponentUpdate()` 如果被定义，就会对新旧 `props`、`state` 进行 `shallowEqual` 比较，新旧一旦不一致，便会触发 `update`。
也可以这么理解：`PureComponent` 通过自带的 `props` 和 `state` 的浅比较实现了 `shouldComponentUpdate()`，这点 `Component` 并不具备

### memo

`memo`：结合了 `pureComponent纯组件` 和 `componentShouldUpdate` 功能，会对传入的props进行一次对比，然后根据第二个函数返回值来进一步判断哪些props需要更新
要注意 `memo` 是一个 `高阶组件` ，`函数式组件` 和 `类组件` 都可以使用。
`memo` 接收两个参数:

- 第一个参数：组件本身，也就是要优化的组件
- 第二个参数：(pre, next) => boolean, `pre`：之前的数据， `next`：现在的数据，返回一个 `布尔值` ，若为 `true` 则不更新，为 `false` 更新。与`shouldComponentUpdate` 的返回值是相反的

### forwardRef

`forwardRef`：引用传递，是一种通过组件向子组件自动传递引用 `ref` 的技术

### Fragment

在 `React` 中，组件是不允许返回多个节点的。`React.Fragment` 等价于 `<></>`。`Fragment` 这个组件可以赋值 `key`，也就是索引，`<></>` 不能赋值

### lazy

`lazy`：允许你定义一个动态加载组件，这样有助于缩减 bundle 的体积，并延迟加载在初次渲染时未用到的组件，也就是懒加载组件（高阶组件）

### Suspense

`Suspense`：让组件"等待"某个异步组件操作，直到该异步操作结束即可渲染。

### Profiler

`Profiler`：这个组件用于性能检测，可以检测一次react组件渲染时的性能开销

### StrictMode

`StrictMode`：严格模式，是一种用于突出显示应用程序中潜在问题的工具

## 工具类

### crateElement

`JSX` 会被编译为 `React.createElement` 的形式

`React.createElement(type, [props], [...children])` 共有三个参数：

- `type`：原生组件的话是标签的字符串，如“div”，如果是React自定义组件，则会传入组件
- `[props]`：对象，dom类中的属性，组件中的props
- `[...children]`：其他的参数，会依此排序

经过 `React.createElement` 的包裹，最终会形成 `$$typeof = Symbol(react.element)` 对象，对象保存了 `react.element` 的信息。

### cloneElement

`cloneElement`：克隆并返回一个新的React元素, 对组件进行一些赋能

### createContext

`createContext`：相信大家对这个Api很熟悉，用于传递上下文。`createContext` 会创建一个 `Context` 对象，用 `Provider` 的 `value` 来传递值，用 `Consumer` 接受 `value`

### Children

`Children`: 提供处理 `this.props.children` 不透明数据结构的实用程序。
<https://juejin.cn/post/7124486630483689485#heading-21>

```jsx
<Child>
      {
        [1,2,3].map((item) => <p key={item}>大家好，我是小杜杜</p>)
      }
  <p>Hello～</p>
</Child>
```

![不透明节点](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd56173a0c05431e8295c363b2e69d5a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

我们遍历的三个元素被包了一层，像这种数据被称为不透明，我们想要处理这种数据，就要以来 `React.Chilren` 来解决

**Children.map**
`Children.map`：遍历，并返回一个数组，针对上面的情况，我们可以通过这个方法将数据便会原先的

```jsx
const Child = ({children}) => {
  const res = React.Children.map(children, (item) => item)
  console.log(res)
  return res
}
```

![Children.map](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/887f747c02d94a2e939cda97bb54489e~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

**Children.forEach**
`Children.forEach` ：与 `Children.map` 类似，不同的是 `Children.forEach` 并不会返回值，而是停留在遍历阶段

**Children.count**
`Children.count`：返回Child内的总个数，等于回调传递给 `map` 或 `forEach` 将被调用的次数

**Children.only**
`Children.only`：验证Child是否只有一个元素，如果是，则正常返回，如果不是，则会报错

**Children.toArray**
`Children.toArray`：以平面数组的形式返回 `children` 不透明数据结构，每个子元素都分配有键。

如果你想在你的渲染方法中操作子元素的集合，特别是如果你想 `this.props.children` 在传递它之前重新排序或切片，这很有用。

```jsx
import React from 'react';

const Child = ({children}) => {
  console.log(`原来数据:`, children)
  const res = React.Children.toArray(children)
  console.log(`扁平后的数据:`, res)
  return res
}

const Index = () => {
  return <div>
    <Child>
      {
        [1,2,3].map((item) => [5, 6].map((ele) => <p key={`${item}-${ele}`}>大家好，我是小杜杜</p>))
      }
      <p>Hello～</p>
    </Child>
  </div>
}

export default Index;
```

![Children.toArray](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/916ea01d44af45f0b1aee498918b040b~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)
这里需要注意的是key,经过Children.toArray处理后，会给原本的key添加前缀，以使得每个元素 key 的范围都限定在此函数入参数组的对象内

### createRef

`createRef`：创建一个 `ref` 对象，获取节点信息

### createFactory

`createFactory`：返回一个生成给定类型的 `React` 元素的函数。
接受一个参数`type`，这个`type`与`createElement`的`type`一样，原生组件的话是标签的字符串，如“div”，如果是React自定义组件，则会传入组件
效果与`createElement`一样，但这个说是遗留的，官方建议直接使用`createElement`，并且在使用上也会给出警告

### isValidElement

`isValidElement`：用于验证是否是 `React` 元素，是的话就返回 `true` ，否则返回 `false`

### version

查看React的版本号

## react-hooks

### useDebugValue

`useDebugValue`：可用于在 `React` 开发者工具中显示 `自定义 hook 的标签`

### React v18中的hooks

### useSyncExternalStore

`useSyncExternalStore`: 是一个推荐用于 `读取` 和 `订阅外部数据源` 的 `hook` ，其方式与选择性的 `hydration` 和时间切片等并发渲染功能兼容

结构：

```js
const state = useSyncExternalStore(subscribe, getSnapshot[, getServerSnapshot])
```

`subscribe`: 订阅函数，用于注册一个回调函数，当存储值发生更改时被调用。此外， `useSyncExternalStore` 会通过带有记忆性的 `getSnapshot` 来判别数据是否发生变化，如果发生变化，那么会 `强制更新` 数据。
`getSnapshot`: 返回当前存储值的函数。必须返回缓存的值。如果 `getSnapshot` 连续多次调用，则必须返回相同的确切值，除非中间有存储值更新。
`getServerSnapshot`：返回服务端( `hydration` 模式下)渲染期间使用的存储值的函数

例子

```jsx
import React, {useSyncExternalStore} from 'react';
import { combineReducers , createStore  } from 'redux'

const reducer = (state=1,action) => {
  switch (action.type){
    case 'ADD':
      return state + 1
    case 'DEL':
      return state - 1
    default:
      return state
  }
}

/* 注册reducer,并创建store */
const rootReducer = combineReducers({ count: reducer  })
const store = createStore(rootReducer,{ count: 1  })

const Index = () => {
    // 订阅
    const state = useSyncExternalStore(store.subscribe,() => store.getState().count)
    return <div>
        <div>{state}</div>
        <div>
          <button onClick={() => store.dispatch({ type:'ADD' })} >加1</button>
          <button style={{marginLeft: 8}} onClick={() => store.dispatch({ type:'DEL' })} >减1</button>
        </div>
    </div>
}

export default Index
```

### useTransition

`useTransition`：返回一个状态值表示过渡任务的等待状态，以及一个启动该过渡任务的函数。
那么什么是过渡任务？
在一些场景中，如：输入框、tab切换、按钮等，这些任务需要视图上 `立刻` 做出响应，这些任务可以称之为立即更新的任务
但有的时候，更新任务并不是那么紧急，或者来说要去请求数据等，导致新的状态不能立更新，需要用一个 `loading...` 的等待状态，这类任务就是过度任务

结构：

```js
const [isPending, startTransition] = useTransition();
```

- `isPending`：过渡状态的标志，为true时是等待状态
- `startTransition`：可以将里面的任务变成过渡任务

例子

```jsx
import React, { useState, useTransition } from 'react';

const Index = () => {

  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);

  return  <div>
      <div>大家好：我是小杜杜~</div>
      输入框： <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          startTransition(() => {
            const res = [];
            for (let i = 0; i < 2000; i++) {
              res.push(e.target.value);
            }
            setList(res);
          });
        }} />
      {isPending ? (
        <div>加载中...</div>
      ) : (
        list.map((item, index) => <div key={index}>{item}</div>)
      )}
    </div>
}

export default Index
```

![useTransition](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a1c6c97b8f742dab5d2e76f56e52223~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

### useDeferredValue

`useDeferredValue`：接受一个值，并返回该值的新副本，该副本将推迟到更紧急地更新之后。
如果当前渲染是一个紧急更新的结果，比如用户输入，`React` 将返回之前的值，然后在紧急渲染完成后渲染新的值。
也就是说 `useDeferredValue` 可以让状态滞后派生

结构：

```jsx
const deferredValue = useDeferredValue(value);
```

- `value`：可变的值，如 `useState` 创建的值
- `deferredValue`: 延时状态

这个感觉和 `useTransition` 有点相似

```jsx
import React, { useState, useDeferredValue } from 'react';

const getList = (key) => {
  const arr = [];
  for (let i = 0; i < 10000; i++) {
    if (String(i).includes(key)) {
      arr.push(<li key={i}>{i}</li>);
    }
  }
  return arr;
};
const Index = () => {
  const [value, setValue] = useState("");
  const deferredValue = useDeferredValue(value);
  console.log('value：', value);
  console.log('deferredValue：',deferredValue);

  return (
    <div >
      <div>
        <div>大家好，我是小杜杜</div>
        输入框：<input onChange={(e) => setValue(e.target.value)} />
      </div>
      <div>
        <ul>{deferredValue ? getList(deferredValue) : null}</ul>
      </div>
    </div>
  );
}

export default Index
```

![useDeferredValue](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7fba0464083c44bf985446b79c2dd55a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

**和useTransition做对比**
根据上面两个示例我们看看 `useTransition` 和 `useDeferredValue` 做个对比看看

相同点：`useDeferredValue` 和 `useTransition` 一样，都是过渡更新任务
不同点：`useTransition` 给的是一个状态，而 `useDeferredValue` 给的是一个值

### useInsertionEffect

`useInsertionEffect`：与 `useEffect` 一样，但它在所有 DOM 突变 之前同步触发。

我们来看看 `useInsertionEffect` 对比于 `useEffect` 和 `useLayoutEffect` 在执行顺序上有什么区别

```jsx
  useEffect(()=>{
    console.log('useEffect')
  },[])

  useLayoutEffect(()=>{
    console.log('useLayoutEffect')
  },[])

  useInsertionEffect(()=>{
    console.log('useInsertionEffect')
  },[])
```

![useInsertionEffect](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a9e3d0646cd34de89a5681f60ee94912~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

可以看到在执行顺序上 `useInsertionEffect` > `useLayoutEffect`  > `useEffect`
特别注意一点：`seInsertionEffect` 应仅限于 `css-in-js` 库作者使用。优先考虑使用 `useEffect` 或 `useLayoutEffect` 来替代。

```jsx
import React, { useInsertionEffect } from 'react';

const Index = () => {

  useInsertionEffect(()=>{
    const style = document.createElement('style')
    style.innerHTML = `
      .css-in-js{
        color: blue;
      }
    `
    document.head.appendChild(style)
 },[])

  return (
    <div>
        <div className='css-in-js'>大家好，我是小杜杜</div>
    </div>
  );
}

export default Index
```

### useId

`useId`：是一个用于生成横跨服务端和客户端的稳定的唯一 ID 的同时避免 `hydration` 不匹配的 hook。这里牵扯到SSR的问题

## react-dom

### createPortal

`createPortal`：在 `Portal` 中提供了一种将子节点渲染到已 DOM 节点中的方式，该节点存在于 DOM 组件的层次结构之外。
也就是说 `createPortal` 可以把当前组件或element元素的子节点，渲染到组件之外的其他地方。
来看看 `createPortal(child, container)` 的入参：

- `child`：任何可渲染的子元素
- `container`：是一个DOM元素

我们可以处理一些顶层元素，如：`Modal` 弹框组件，`Modal` 组件在内部中书写，挂载到外层的容器（如body），此时这个Api就非常有用

<https://juejin.cn/post/7124486630483689485#heading-68>

### flushSync

`flushSync`：可以将回调函数中的更新任务，放到一个较高级的优先级中，适用于强制刷新，同时确保了DOM会被立即更新

```jsx
    onClick={() => {
      this.setState({ number: 1  })
      ReactDOM.flushSync(()=>{
        this.setState({ number: 2  })
      })
      this.setState({ number: 3  })
    }}
```

`flushSync` 会优先执行，并且强制刷新，所以会改变number值为2，然后1和3在被批量刷新，更新为3

### render

`render`：这个是我们在react-dom中最常用的Api，用于渲染一个react元素

### createRoot

在React v18中，`render` 函数已经被 `createRoot` 所替代
`createRoot` 会控制你传入的容器节点的内容。当调用 `render` 时，里面的任何现有 DOM 元素都会被替换。后面的调用使用 React 的 DOM diffing 算法进行有效更新。
并且 `createRoot` 不修改容器节点（只修改容器的子节点）。可以在不覆盖现有子节点的情况下将组件插入现有 DOM 节点。

```jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Main />
  </StrictMode>
);
```

### hydrate

`hydrate`：服务端渲染用 `hydrate` 与 `render()` 相同，但它用于在 `ReactDOMServer` 渲染的容器中对 `HTML` 的内容进行 `hydrate` 操作。

```js
hydrate(element, container[, callback])
```

### hydrateRoot()

`hydrate` 在 `React v18` 也被替代为 `hydrateRoot()`

```js
hydrateRoot(container, element[, options])
```

### unmountComponentAtNode

`unmountComponentAtNode`：从 DOM 中卸载组件，会将其事件处理器（event handlers）和 state 一并清除。如果指定容器上没有对应已挂载的组件，这个函数什么也不会做。如果组件被移除将会返回 true，如果没有组件可被移除将会返回 false。

### root.unmount()

`unmountComponentAtNode` 同样在React 18中被替代了，替换成了 `createRoot` 中的 `unmount()` 方法

### findDOMNode

`findDOMNode`：用于访问组件DOM元素节点（应急方案），官方推荐使用 `ref`
需要注意的是：

- `findDOMNode` 只能用到挂载的组件上
- `findDOMNode` 只能用于类组件，不能用于函数式组件
- 如果组件渲染为 `null` 或者为 `false` ，那么 `findDOMNode` 返回的值也是null
- 如果是多个子节点 `Fragment` 的情况，`findDOMNode` 会返回第一个非空子节点对应的 DOM 节点。
- 在严格模式下这个方法已经被弃用

```jsx
import { Button } from 'antd-mobile';
import React, { Component} from 'react';
import ReactDOM from 'react-dom'
 

class Index extends Component{

  render(){

    return <div style={{padding: 20}}>
      <div>大家好，我是小杜杜</div> 
      <Button
        color='primary'
        onClick={() => {
          console.log(ReactDOM.findDOMNode(this))
        }}
      >
        获取容器
      </Button>    
    </div>
  }
}

export default Index;
```

### unstable_batchedUpdates

`unstable_batchedUpdates` :可用于手动批量更新state，可以指定多个 `setState` 合并为一个更新请求
