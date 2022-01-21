# 全栈潇晨 人人都能读懂的react源码解析

课程地址
<https://xiaochen1024.com/article_page>

## 开篇介绍

![React源码解析结构图](https://gitee.com/xiaochen1024/assets/raw/master/assets/react%E6%BA%90%E7%A0%811.1.png)

### React源码知识点

在源码的`scheduler`中使用了小顶堆 这种数据结构，调度的实现则使用了`messageChannel`，在render阶段的reconciler中则使用了`fiber`、`update`、`链表` 这些结构，lane模型使用了二进制掩码，我们也会介绍diff算法怎样降低对比复杂度。

## React的设计理念

### 异步可中断

React15慢在哪里
React15之前的协调过程是同步的，也叫stack reconciler，又因为js的执行是单线程的，这就导致了在更新比较耗时的任务时，不能及时响应一些高优先级的任务，比如用户的输入，所以页面就会卡顿，这就是cpu的限制。

解决方案
任务分割，和异步执行，并且能让出执行权，

React实现

- Fiber：react15的更新是同步的，因为它不能将任务分割，所以需要一套数据结构让它既能对应真实的dom又能作为分隔的单元，这就是Fiber。
- Scheduler：有了Fiber，我们就需要用浏览器的时间片异步执行这些Fiber的工作单元，我们知道浏览器有一个api叫做requestIdleCallback，它可以在浏览器空闲的时候执行一些任务，我们用这个api执行react的更新，让高优先级的任务优先响应不就可以了吗，但事实是requestIdleCallback存在着浏览器的兼容性和触发不稳定的问题，所以我们需要用js实现一套时间片运行的机制，在react中这部分叫做scheduler。
- Lane：有了异步调度，我们还需要细粒度的管理各个任务的优先级，让高优先级的任务优先执行，各个Fiber工作单元还能比较优先级，相同优先级的任务可以一起更新，想想是不是更cool呢。

产生出来的上层特性
由于有了这一套异步可中断的机制，我们就能实现batchedUpdates批量更新和Suspense

## React源码架构

### React渲染的大致流程

Scheduler（调度器）： 排序优先级，让优先级高的任务先进行reconcile
Reconciler（协调器）： 找出哪些节点发生了改变，并打上不同的Flags（旧版本react叫Tag）
Renderer（渲染器）： 将Reconciler中打好标签的节点渲染到视图上
![调度器、协调器、渲染器关联](https://gitee.com/xiaochen1024/assets/raw/master/assets/react%E6%BA%90%E7%A0%813.1.png)
![渲染流程](https://gitee.com/xiaochen1024/assets/raw/master/assets/20210602082005.png)

### jsx

jsx是js语言的扩展，react通过babel词法解析（具体怎么转换可以查阅babel相关插件），将jsx转换成React.createElement，React.createElement方法返回virtual-dom对象（内存中用来描述dom阶段的对象），所有jsx本质上就是React.createElement的语法糖，它能声明式的编写我们想要组件呈现出什么样的ui效果。

### Fiber双缓存

Fiber对象上面保存了包括这个节点的属性、类型、dom等，Fiber通过child、sibling、return（指向父节点）来形成Fiber树，还保存了更新状态时用于计算state的updateQueue，updateQueue是一种链表结构，上面可能存在多个未计算的update，update也是一种数据结构，上面包含了更新的数据、优先级等，除了这些之外，上面还有和副作用有关的信息。

双缓存是指存在两颗Fiber树，current Fiber树描述了当前呈现的dom树，workInProgress Fiber是正在更新的Fiber树，这两颗Fiber树都是在内存中运行的，在workInProgress Fiber构建完成之后会将它作为current Fiber应用到dom上

在mount时（首次渲染），会根据jsx对象（Class Component或的render函数者Function Component的返回值），构建Fiber对象，形成Fiber树，然后这颗Fiber树会作为current Fiber应用到真实dom上，在update（状态更新时如setState）的时候，会根据状态变更后的jsx对象和current Fiber做对比形成新的workInProgress Fiber，然后workInProgress Fiber切换成current Fiber应用到真实dom就达到了更新的目的，而这一切都是在内存中发生的，从而减少了对dom好性能的操作。
