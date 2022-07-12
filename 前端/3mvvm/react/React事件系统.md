# React事件系统

[「react进阶」一文吃透react事件系统原理](https://juejin.cn/post/6955636911214067720)

![总览](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/46124c3589a1468aac72590d16f4787a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

## 前置知识概念

### JSX事件终将变成什么

```js
class Index extends React.Component{
    handerClick= (value) => console.log(value) 
    render(){
        return <div>
            <button onClick={ this.handerClick } > 按钮点击 </button>
        </div>
    }
}
```

经过 `babel` 转换成 `React.createElement` 形式
![React.createElement onClick](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02eb66989a5444839c4e758b795869e7~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

最终转成 `fiber` 对象
![fiber props event](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2bd1a74076c40d1b5c5e7b53c341f7f~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

### 什么是合成事件？

![react dom event](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fbd5b7c204754983b1eacc7bdcec8f88~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

button上绑定了两个事件，一个是document上的事件监听器，另外一个是button，但是事件处理函数`handle`，并不是我们的`handerClick`事件，而是noop。然后我们看document绑定的事件，可以看到click事件被绑定在document上了。如果我们给input绑定的onChange，那么事件并没有直接绑定在input上，而是统一绑定在了document上，然后我们onChange被处理成很多事件监听器，比如blur , change , input , keydown , keyup 等。

![react document event](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b0df2ea775b24970aed90b79585da8a6~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

结论：

①我们在 `jsx` 中绑定的事件,根本就没有注册到真实的dom上。是绑定在document上统一管理的。
②真实的`dom`上的`click`事件被单独处理,已经被react底层替换成空函数。
③我们在react绑定的事件,比如`onChange`，在document上，可能有多个事件与之对应。
④react并不是一开始，把所有的事件都绑定在document上，而是采取了一种按需绑定，比如发现了onClick事件,再去绑定document click事件。

事件合成就是 **在react中，我们绑定的事件onClick等，并不是原生事件，而是由原生事件合成的React事件，比如 click事件合成为onClick事件。比如blur , change , input , keydown , keyup等 , 合成为onChange。**

**那么react采取这种事件合成的模式呢？**
一方面，将事件绑定在document统一管理，防止很多事件直接绑定在原生的dom元素上。造成一些不可控的情况
另一方面， React 想实现一个全浏览器的框架， 为了实现这种目标就需要提供全浏览器一致性的事件系统，以此抹平不同浏览器的差异。

### dom元素对应的fiber Tag对象

`<div> hello , my name is alien </div> 对应的 fiber类型。 tag = 5`

```js
// react-reconciler/src/ReactWorkTagsq.js
export const HostComponent = 5; // 元素节点
```

## 事件初始化-事件合成，插件机制

### 事件合成-事件插件

`namesToPlugins`
`namesToPlugins` 装事件名 -> 事件模块插件的映射,`namesToPlugins`最终的样子如下

```js
const namesToPlugins = {
    SimpleEventPlugin,
    EnterLeaveEventPlugin,
    ChangeEventPlugin,
    SelectEventPlugin,
    BeforeInputEventPlugin,
}
```

`SimpleEventPlugin` 等是处理各个事件函数的插件，比如一次点击事件，就会找到 `SimpleEventPlugin` 对应的处理函数。

`plugins`
这个对象就是上面注册的所有插件列表,初始化为空。

```js
const  plugins = [LegacySimpleEventPlugin, LegacyEnterLeaveEventPlugin, ...];
```

`registrationNameModules`
记录了React合成的事件-对应的事件插件的关系，在React中，处理`props`中事件的时候，会根据不同的事件名称，找到对应的事件插件，然后统一绑定在document上。对于没有出现过的事件，就不会绑定，我们接下来会讲到。registrationNameModules大致的样子如下所示。

```js
{
    onBlur: SimpleEventPlugin,
    onClick: SimpleEventPlugin,
    onClickCapture: SimpleEventPlugin,
    onChange: ChangeEventPlugin,
    onChangeCapture: ChangeEventPlugin,
    onMouseEnter: EnterLeaveEventPlugin,
    onMouseLeave: EnterLeaveEventPlugin,
    ...
}
```

`事件插件`
事件插件是一个对象，有两个属性，第一个`extractEvents`作为事件统一处理函数，第二个`eventTypes`是一个对象，对象保存了原生事件名和对应的配置项`dispatchConfig`的映射关系。由于v16React的事件是统一绑定在document上的，React用独特的事件名称比如`onClick`和`onClickCapture`，来说明我们给绑定的函数到底是在冒泡事件阶段，还是捕获事件阶段执行。

`registrationNameDependencies`
`registrationNameDependencies`用来记录，合成事件比如 `onClick` 和原生事件 `click`对应关系。比如 `onChange` 对应 `change , input , keydown , keyup`事件。

```js
{
    onBlur: ['blur'],
    onClick: ['click'],
    onClickCapture: ['click'],
    onChange: ['blur', 'change', 'click', 'focus', 'input', 'keydown', 'keyup', 'selectionchange'],
    onMouseEnter: ['mouseout', 'mouseover'],
    onMouseLeave: ['mouseout', 'mouseover'],
    ...
}
```

### 事件初始化

对于事件合成，v16.13.1版本react采用了初始化注册方式。

```js
// react-dom/src/client/ReactDOMClientInjection.js
/* 第一步：注册事件：  */
injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin,
});
```

简化这个函数,看它到底是干什么的。

```js
// legacy-event/EventPluginRegistry.js
/* 注册事件插件 */
export function injectEventPluginsByName(injectedNamesToPlugins){
     for (const pluginName in injectedNamesToPlugins) {
         namesToPlugins[pluginName] = injectedNamesToPlugins[pluginName]
     }
     recomputePluginOrdering()
}
```

`injectEventPluginsByName` 做的事情很简单，形成上述的`namesToPlugins`，然后执行`recomputePluginOrdering`

```js
const eventPluginOrder = [ 'SimpleEventPlugin' , 'EnterLeaveEventPlugin','ChangeEventPlugin','SelectEventPlugin' , 'BeforeInputEventPlugin' ]

function recomputePluginOrdering(){
    for (const pluginName in namesToPlugins) {
        /* 找到对应的事件处理插件，比如 SimpleEventPlugin  */
        const pluginModule = namesToPlugins[pluginName];
        const pluginIndex = eventPluginOrder.indexOf(pluginName);
        /* 填充 plugins 数组  */
        plugins[pluginIndex] = pluginModule;
        const publishedEvents = pluginModule.eventTypes;
        for (const eventName in publishedEvents) {
            // publishedEvents[eventName] -> eventConfig , pluginModule -> 事件插件 ， eventName -> 事件名称
            publishEventForPlugin(publishedEvents[eventName],pluginModule,eventName,)
        } 
    }
}
```

`recomputePluginOrdering` 形成上面说的那个 `plugins` 数组。然后就是重点的函数 `publishEventForPlugin` 。

```js
/*
  dispatchConfig -> 原生事件对应配置项 { phasedRegistrationNames :{  冒泡 捕获  } ，   }
  pluginModule -> 事件插件 比如SimpleEventPlugin  
  eventName -> 原生事件名称。
*/
function publishEventForPlugin (dispatchConfig,pluginModule,eventName){
    eventNameDispatchConfigs[eventName] = dispatchConfig;
    /* 事件 */
    const phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
    if (phasedRegistrationNames) {
    for (const phaseName in phasedRegistrationNames) {
        if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
            // phasedRegistrationName React事件名 比如 onClick / onClickCapture
            const phasedRegistrationName = phasedRegistrationNames[phaseName];
            // 填充形成 registrationNameModules React 合成事件 -> React 处理事件插件映射关系
            registrationNameModules[phasedRegistrationName] = pluginModule;
            // 填充形成 registrationNameDependencies React 合成事件 -> 原生事件 映射关系
            registrationNameDependencies[phasedRegistrationName] = pluginModule.eventTypes[eventName].dependencies;
        }
    }
    return true;
    }
}
```

`publishEventForPlugin` 作用是形成上述的 `registrationNameModules` 和 `registrationNameDependencies` 对象中的映射关系。

### 事件绑定-从一次点击事件开始

#### 事件绑定流程

##### diffProperties 处理React合成事件

```js
<div>
  <button onClick={ this.handerClick }  className="button" >点击</button>
</div>
```

第一步 绑定给 `hostComponent` 种类的 `fiber` (如上的button元素) 会以`memoizedProps` 和 `pendingProps` 保存
![fiber props event](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dec68c8a3d6d47d18aaecd565861cb97~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

第二步 React在调合子节点后，进入diff阶段，如果判断是 `HostComponent` (dom元素)类型的fiber，会用diff props函数 `diffProperties` 单独处理。

```js
// react-dom/src/client/ReactDOMComponent.js

function diffProperties(){
    /* 判断当前的 propKey 是不是 React合成事件 */
    if(registrationNameModules.hasOwnProperty(propKey)){
         /* 这里多个函数简化了，如果是合成事件， 传入成事件名称 onClick ，向document注册事件  */
         legacyListenToEvent(registrationName, document);
    }
}
```

`diffProperties` 函数在 `diff props` 如果发现是合成事件(onClick) 就会调用 `legacyListenToEvent` 函数。注册事件监听器。

##### legacyListenToEvent 注册事件监听器

```js
// react-dom/src/events/DOMLegacyEventPluginSystem.js

//  registrationName -> onClick 事件
//  mountAt -> document or container
function legacyListenToEvent(registrationName，mountAt){
   const dependencies = registrationNameDependencies[registrationName]; // 根据 onClick 获取  onClick 依赖的事件数组 [ 'click' ]。
    for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
    //这个经过多个函数简化，如果是 click 基础事件，会走 legacyTrapBubbledEvent ,而且都是按照冒泡处理
     legacyTrapBubbledEvent(dependency, mountAt);
  }
}

function legacyTrapBubbledEvent(topLevelType,element){
   addTrappedEventListener(element,topLevelType,PLUGIN_EVENT_SYSTEM,false)
}
```

legacyTrapBubbledEvent 就是执行将绑定真正的dom事件的函数 legacyTrapBubbledEvent(冒泡处理)。

第三步 在 `legacyListenToEvent` 函数中，先找到 React 合成事件对应的原生事件集合，比如 `onClick -> ['click']` , `onChange -> [blur , change , input , keydown , keyup]`，然后遍历依赖项的数组，绑定事件，这就解释了，**为什么我们在刚开始的demo中，只给元素绑定了一个onChange事件，结果在document上出现很多事件监听器的原因，就是在这个函数上处理的。**

一些事件的处理，有些特殊的事件是按照事件捕获处理的

```js
case TOP_SCROLL: {                                // scroll 事件
    legacyTrapCapturedEvent(TOP_SCROLL, mountAt); // legacyTrapCapturedEvent 事件捕获处理。
    break;
}
case TOP_FOCUS: // focus 事件
case TOP_BLUR:  // blur 事件
legacyTrapCapturedEvent(TOP_FOCUS, mountAt);
legacyTrapCapturedEvent(TOP_BLUR, mountAt);
break;
```

##### 绑定 dispatchEvent，进行事件监听

如上述的`scroll`事件，`focus` 事件 ，`blur`事件等，是默认按照事件捕获逻辑处理。接下来就是最重要关键的一步。React是如何绑定事件到`document`？ 事件处理函数函数又是什么？问题都指向了上述的`addTrappedEventListener`，让我们来揭开它的面纱。

```js
/*
  targetContainer -> document
  topLevelType ->  click
  capture = false
*/
function addTrappedEventListener(targetContainer,topLevelType,eventSystemFlags,capture){
   const listener = dispatchEvent.bind(null,topLevelType,eventSystemFlags,targetContainer) 
   if(capture){
       // 事件捕获阶段处理函数。
   }else{
       /* TODO: 重要, 这里进行真正的事件绑定。*/
      targetContainer.addEventListener(topLevelType,listener,false) // document.addEventListener('click',listener,false)
   }
}
```

第四步 函数内容虽然不多，但是却非常重要,首先绑定我们的事件统一处理函数 `dispatchEvent`，绑定几个默认参数，事件类型 `topLevelType` demo中的click ，还有绑定的容器doucment。**然后真正的事件绑定,添加事件监听器addEventListener。 事件绑定阶段完毕。**

事件绑定过程总结

- 在React，diff DOM元素类型的fiber的props的时候， 如果发现是React合成事件，比如onClick，会按照事件系统逻辑单独处理。
- 根据React合成事件类型，找到对应的原生事件的类型，然后调用判断原生事件类型，大部分事件都按照冒泡逻辑处理，少数事件会按照捕获逻辑处理（比如scroll事件）。
- 调用 addTrappedEventListener 进行真正的事件绑定，绑定在document上，`dispatchEvent` 为统一的事件处理函数。
- 有一点值得注意: 只有上述那几个特殊事件比如 scorll,focus,blur等是在事件捕获阶段发生的，其他的都是在事件冒泡阶段发生的，无论是onClick还是onClickCapture都是发生在冒泡阶段，至于 React 本身怎么处理捕获逻辑的。我们接下来会讲到。

### 事件触发-一次点击事件，在react底层系统会发生什么？

#### 事件触发处理函数 dispatchEvent

我们在事件绑定阶段讲过，React事件注册时候，统一的监听器 `dispatchEvent` ，也就是当我们点击按钮之后，首先执行的是dispatchEvent函数，因为dispatchEvent前三个参数已经被bind了进去，所以真正的事件源对象 `event` ，被默认绑定成第四个参数。

```js
// react-dom/src/events/ReactDOMEventListener.js
function dispatchEvent(topLevelType,eventSystemFlags,targetContainer,nativeEvent){
    /* 尝试调度事件 */
    const blockedOn = attemptToDispatchEvent( topLevelType,eventSystemFlags, targetContainer, nativeEvent);
}

/*
topLevelType -> click
eventSystemFlags -> 1
targetContainer -> document
nativeEvent -> 原生事件的 event 对象
*/
function attemptToDispatchEvent(topLevelType,eventSystemFlags,targetContainer,nativeEvent){
    /* 获取原生事件 e.target */
    const nativeEventTarget = getEventTarget(nativeEvent)
    /* 获取当前事件，最近的dom类型fiber ，我们 demo中 button 按钮对应的 fiber */
    let targetInst = getClosestInstanceFromNode(nativeEventTarget); 
    /* 重要：进入legacy模式的事件处理系统 */
    dispatchEventForLegacyPluginEventSystem(topLevelType,eventSystemFlags,nativeEvent,targetInst,);
    return null;
}
```

在这个阶段主要做了这几件事：

- 首先根据真实的事件源对象，找到 `e.target` 真实的 `dom` 元素。
- 然后根据 `dom` 元素，找到与它对应的 `fiber` 对象 `targetInst`，在我们 `demo` 中，找到 `button` 按钮对应的 `fiber`。
- 然后正式进去 `legacy` 模式的事件处理系统，也就是我们目前用的React模式都是legacy模式下的，在这个模式下，批量更新原理，即将拉开帷幕。

**React怎么样通过原生的dom元素，找到对应的fiber的呢？**
也就是说 getClosestInstanceFromNode 原理是什么？

答案是首先 `getClosestInstanceFromNode` 可以找到当前传入的 `dom` 对应的最近的元素类型的 `fiber` 对象。React 在初始化真实 dom 的时候，用一个随机的 `key internalInstanceKey`  指针指向了当前 `dom` 对应的 `fiber` `对象，fiber` 对象用 `stateNode` 指向了当前的 `dom` 元素。

```js
// 声明随机key
var internalInstanceKey = '__reactInternalInstance$' + randomKey;

// 使用随机key 
function getClosestInstanceFromNode(targetNode){
  // targetNode -dom  targetInst -> 与之对应的fiber对象
  var targetInst = targetNode[internalInstanceKey];
}
```

![dom fiber 两者关系图](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb9df1e3d518405aaac807e9ba2ade89~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)
![在谷歌调试器上看 dom fiber](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/378e7203f8214367a2607eca388d8c4c~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

#### legacy 事件处理系统与批量更新

```js
// react-dom/src/events/DOMLegacyEventPluginSystem.js
/* topLevelType - click事件 ｜ eventSystemFlags = 1 ｜ nativeEvent = 事件源对象  ｜ targetInst = 元素对应的fiber对象  */
function dispatchEventForLegacyPluginEventSystem(topLevelType,eventSystemFlags,nativeEvent,targetInst){
    /* 从React 事件池中取出一个，将 topLevelType ，targetInst 等属性赋予给事件  */
    const bookKeeping = getTopLevelCallbackBookKeeping(topLevelType,nativeEvent,targetInst,eventSystemFlags);
    try { /* 执行批量更新 handleTopLevel 为事件处理的主要函数 */
    batchedEventUpdates(handleTopLevel, bookKeeping);
  } finally {
    /* 释放事件池 */  
    releaseTopLevelCallbackBookKeeping(bookKeeping);
  }
}
```

对于v16事件池，我们接下来会讲到，首先 `batchedEventUpdates` 为批量更新的主要函数。我们先来看看 `batchedEventUpdates`

```js
// react-dom/src/events/ReactDOMUpdateBatching.js
export function batchedEventUpdates(fn,a){
    isBatchingEventUpdates = true;
    try{
       fn(a) // handleTopLevel(bookKeeping)
    }finally{
        isBatchingEventUpdates = false
    }
}
```

批量更新简化成如上的样子，从上面我们可以看到，React通过开关`isBatchingEventUpdates` 来控制是否启用批量更新。fn(a)，事件上调用的是 `handleTopLevel(bookKeeping)` ，由于js是单线程的，我们真正在组件中写的事件处理函数，比如demo 的 `handerClick` 实际执行是在 `handleTopLevel(bookKeeping)` 中执行的。所以如果我们在 `handerClick` 里面触发 `setState` ，那么就能读取到 `isBatchingEventUpdates = true` 这就是React的合成事件为什么具有批量更新的功能了。

```js
state={number:0}
handerClick = () =>{
    this.setState({number: this.state.number + 1   })
    console.log(this.state.number) //0
    this.setState({number: this.state.number + 1   })
    console.log(this.state.number) //0
    setTimeout(()=>{
        this.setState({number: this.state.number + 1   })
        console.log(this.state.number) //2
        this.setState({number: this.state.number + 1   })
        console.log(this.state.number)// 3
    })
}
```

如上述所示，第一个`setState`和第二个`setState`在批量更新条件之内执行，所以打印不会是最新的值，但是如果是发生在`setTimeout`中,由于 eventLoop 放在了下一次事件循环中执行，此时 batchedEventUpdates 中已经执行完`isBatchingEventUpdates = false` ，所以批量更新被打破，我们就可以直接访问到最新变化的值了。

#### 执行事件插件函数

handleTopLevel 到底做了什么事情？

```js
// 流程简化后
// topLevelType - click  
// targetInst - button Fiber
// nativeEvent
function handleTopLevel(bookKeeping){
    const { topLevelType,targetInst,nativeEvent,eventTarget, eventSystemFlags} = bookKeeping
    for(let i=0; i < plugins.length;i++ ){
        const possiblePlugin = plugins[i];
        /* 找到对应的事件插件，形成对应的合成event，形成事件执行队列  */
        const  extractedEvents = possiblePlugin.extractEvents(topLevelType,targetInst,nativeEvent,eventTarget,eventSystemFlags)  
    }
    if (extractedEvents) {
        events = accumulateInto(events, extractedEvents);
    }
    /* 执行事件处理函数 */
    runEventsInBatch(events);
}
```

核心的流程中，`handleTopLevel` 最后的处理逻辑就是执行我们说的事件处理插件(SimpleEventPlugin)中的处理函数 `extractEvents` ，比如我们demo中的点击事件 onClick 最终走的就是 `SimpleEventPlugin` 中的 `extractEvents` 函数，那么React为什么这么做呢? 我们知道我们React是采取事件合成，事件统一绑定，并且我们写在组件中的事件处理函数( handerClick )，也不是真正的执行函数`dispatchAciton`，那么我们在 `handerClick` 的事件对象 `event` ,也是React单独合成处理的，里面单独封装了比如 `stopPropagation` 和 `preventDefault` 等方法，**这样的好处是，我们不需要跨浏览器单独处理兼容问题，交给React底层统一处理。**

#### extractEvents 形成事件对象event 和 事件处理函数队列

重点来了！，`extractEvents` 可以作为整个事件系统核心函数，我们先回到最初的demo，如果我们这么写,那么四个回调函数，那么点击按钮，四个事件是如何处理的呢。首先如果点击按钮，最终走的就是 `extractEvents` 函数，一探究竟这个函数。

```js
// legacy-events/SyntheticEvent.js
const  SimpleEventPlugin = {
    extractEvents:function(topLevelType,targetInst,nativeEvent,nativeEventTarget){
        const dispatchConfig = topLevelEventsToDispatchConfig.get(topLevelType);
        if (!dispatchConfig) {
            return null;
        }
        switch(topLevelType){
            default:
            EventConstructor = SyntheticEvent;
            break;
        }
        /* 产生事件源对象 */
        const event = EventConstructor.getPooled(dispatchConfig,targetInst,nativeEvent,nativeEventTarget)
        const phasedRegistrationNames = event.dispatchConfig.phasedRegistrationNames;
        const dispatchListeners = [];
        const {bubbled, captured} = phasedRegistrationNames; /* onClick / onClickCapture */
        const dispatchInstances = [];
        /* 从事件源开始逐渐向上，查找dom元素类型HostComponent对应的fiber ，收集上面的React合成事件，onClick / onClickCapture  */
         while (instance !== null) {
              const {stateNode, tag} = instance;
              if (tag === HostComponent && stateNode !== null) { /* DOM 元素 */
                   const currentTarget = stateNode;
                   if (captured !== null) { /* 事件捕获 */
                        /* 在事件捕获阶段,真正的事件处理函数 */
                        const captureListener = getListener(instance, captured);
                        if (captureListener != null) {
                        /* 对应发生在事件捕获阶段的处理函数，逻辑是将执行函数unshift添加到队列的最前面 */
                            dispatchListeners.unshift(captureListener);
                            dispatchInstances.unshift(instance);
                            dispatchCurrentTargets.unshift(currentTarget);
                        }
                    }
                    if (bubbled !== null) { /* 事件冒泡 */
                        /* 事件冒泡阶段，真正的事件处理函数，逻辑是将执行函数push到执行队列的最后面 */
                        const bubbleListener = getListener(instance, bubbled);
                        if (bubbleListener != null) {
                            dispatchListeners.push(bubbleListener);
                            dispatchInstances.push(instance);
                            dispatchCurrentTargets.push(currentTarget);
                        }
                    }
              }
              instance = instance.return;
         }
          if (dispatchListeners.length > 0) {
              /* 将函数执行队列，挂到事件对象event上 */
            event._dispatchListeners = dispatchListeners;
            event._dispatchInstances = dispatchInstances;
            event._dispatchCurrentTargets = dispatchCurrentTargets;
         }
        return event
    }
}
```

事件插件系统的核心 `extractEvents` 主要做的事是:

- 首先形成React事件独有的合成事件源对象，这个对象，保存了整个事件的信息。将作为参数传递给真正的事件处理函数(handerClick)。
- 然后声明事件执行队列 ，按照冒泡和捕获逻辑，从事件源开始逐渐向上，查找dom元素类型HostComponent对应的fiber ，收集上面的 React 合成事件，例如 onClick / onClickCapture ，对于冒泡阶段的事件(onClick)，将 `push` 到执行队列后面 ， 对于捕获阶段的事件(onClickCapture)，将 `unShift` 到执行队列的前面。
- 最后将事件执行队列，保存到React事件源对象上。等待执行。

举个例子

```js
handerClick1 = () => console.log(1)
handerClick2 = () => console.log(2)
handerClick3 = () => console.log(3) 
handerClick4= () => console.log(4)
render(){
    return <div onClick={ this.handerClick3 } onClickCapture={this.handerClick4}  > 
        <button onClick={ this.handerClick1 }  onClickCapture={ this.handerClick2  }  className="button" >点击</button>
    </div>
}

//  4 2 1 3
```

![react event queue](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/514a83eb13df4dd58ec0ebc1dca1873d~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

#### 事件触发

React的事件源对象 `SyntheticEvent`

```js
// legacy-events/SyntheticEvent.js
function SyntheticEvent( dispatchConfig,targetInst,nativeEvent,nativeEventTarget){
  this.dispatchConfig = dispatchConfig;
  this._targetInst = targetInst;
  this.nativeEvent = nativeEvent;
  this._dispatchListeners = null;
  this._dispatchInstances = null;
  this._dispatchCurrentTargets = null;
  this.isPropagationStopped = () => false; /* 初始化，返回为false  */

}
SyntheticEvent.prototype={
    stopPropagation(){ this.isPropagationStopped = () => true;  }, /* React单独处理，阻止事件冒泡函数 */
    preventDefault(){ },  /* React单独处理，阻止事件捕获函数  */
    ...
}
```

在 handerClick 中打印 e
![SyntheticEvent](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d08582e53df4cb5a43cb40fc2db5ef4~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

`runEventsInBatch`，所有事件绑定函数，就是在这里触发的

```js
// legacy-events/EventBatching.js
function runEventsInBatch(){
    const dispatchListeners = event._dispatchListeners;
    const dispatchInstances = event._dispatchInstances;
    if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) { /* 判断是否已经阻止事件冒泡 */
        break;
      }
      
      dispatchListeners[i](event)
    }
  }
  /* 执行完函数，置空两字段 */
  event._dispatchListeners = null;
  event._dispatchInstances = null;
}
```

`dispatchListeners[i](event)` 就是执行我们的事件处理函数比如handerClick阻止浏览器默认行为

```js
handerClick(e){
    e.preventDefault()
}
```

另一方面React对于阻止冒泡，就是通过isPropagationStopped，判断是否已经阻止事件冒泡。如果我们在事件函数执行队列中，某一会函数中，调用 `e.stopPropagation()` ，就会赋值给 `isPropagationStopped=()=>true` ，当再执行 `e.isPropagationStopped()` 就会返回 true ,接下来事件处理函数，就不会执行了。

#### 其他概念-事件池

```js
handerClick = (e) => {
    console.log(e.target) // button 
    setTimeout(()=>{
        console.log(e.target) // null
    },0)
}
```

对于一次点击事件的处理函数，在正常的函数执行上下文中打印 `e.target` 就指向了 `dom` 元素，但是在 `setTimeout` 中打印却是 `null` ，如果这不是React事件系统，两次打印的应该是一样的，但是为什么两次打印不一样呢？ **因为在React采取了一个事件池的概念，每次我们用的事件源对象，在事件函数执行之后，可以通过`releaseTopLevelCallbackBookKeeping` 等方法将事件源对象释放到事件池中，这样的好处每次我们不必再创建事件源对象，可以从事件池中取出一个事件源对象进行复用，在事件处理函数执行完毕后,会释放事件源到事件池中，清空属性，这就是 `setTimeout` 中打印为什么是 `null` 的原因了。**

事件触发总结

- **首先通过统一的事件处理函数 `dispatchEvent` ，进行批量更新batchUpdate。**
- **然后执行事件对应的处理插件中的 `extractEvents` ，合成事件源对象,每次React会从事件源开始，从上遍历类型为 hostComponent即 dom类型的fiber,判断props中是否有当前事件比如onClick,最终形成一个事件执行队列，React就是用这个队列，来模拟事件捕获->事件源->事件冒泡这一过程。**
- **最后通过 `runEventsInBatch` 执行事件队列，如果发现阻止冒泡，那么break跳出循环，最后重置事件源，放回到事件池中，完成整个流程。**

## 关于react v17版本的事件系统

React v17 整体改动不是很大，但是事件系统的改动却不小，首先上述的很多执行函数，在v17版本不复存在了。我来简单描述一下v17事件系统的改版。

**事件统一绑定container上，ReactDOM.render(app， container);而不是document上，这样好处是有利于微前端的，微前端一个前端系统中可能有多个应用，如果继续采取全部绑定在document上，那么可能多应用下会出现问题。**
![container](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/83f4440adffa41b7a82cdb97e7951168~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

**对齐原生浏览器事件**
React 17 中终于支持了原生捕获事件的支持， 对齐了浏览器原生标准。同时 `onScroll` 事件不再进行事件冒泡。`onFocus` 和 `onBlur` 使用原生 `focusin`， `focusout` 合成。

**取消事件池** React 17 取消事件池复用，也就解决了上述在`setTimeout`打印，找不到`e.target`的问题。
