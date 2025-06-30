# 图片懒加载

![图片懒加载的前世今生](https://juejin.cn/post/6844903801590120462)

HTML 中的图片资源会自上而下依次加载，而部分图片只有在用户向下滚动页面的场景下才能被看见，否则这部分图片的流量就白白浪费了。

图片懒加载技术主要通过监听图片资源容器是否出现在视口区域内，来决定图片资源是否被加载。

那么实现图片懒加载技术的核心就是如何判断元素处于视口区域之内。

## 早前实现的思路

- 给目标元素指定一张占位图，将真实的图片链接存储在自定义属性中，通常是 `data-src`；
- 监听与用户滚动行为相关的 `scroll` 事件；
- 在 `scroll` 事件处理程序中利用 `Element.getBoundingClientRect()` 方法判断目标元素与视口的交叉状态；
- 当目标元素与视口的交叉状态大于0时，将真实的图片链接赋给目标元素 `src` 属性或者 `backgroundImage` 属性。

**scroll 事件**
scroll 事件可能会被高频度的触发，可以采用函数节流的方式降低 DOM 操作的频率，还可以通过 window.requestAnimationFrame() 方法实现

**getBoundingClientRect()方法**
返回元素的大小以及相对于视口的位置信息，top 和 left 是目标元素左上角坐标与网页左上角坐标的偏移值，width 和 height 是目标元素自身的宽度和高度

```js
function isElementInViewport (el) {
  const { top, height, left, width } = el.getBoundingClientRect()
  const w = window.innerWidth || document.documentElement.clientWidth
  const h = window.innerHeight || document.documentElement.clientHeight
  return (
    top <= h && // 顶
    (top + height) >= 0 && // 底
    left <= w &&
    (left + width) >= 0
  )
}
```

**window.addEventListener('scroll')**

## IntersectionObserver

`IntersectionObserver` 构造函数接收两个参数，回调函数以及配置项

配置项中的参数有以下三个：

`root`：所监听对象的具体祖先元素，默认是 viewport ；
`rootMargin`：计算交叉状态时，将 margin 附加到祖先元素上，从而有效的扩大或者缩小祖先元素判定区域；
`threshold`：设置一系列的阈值，当交叉状态达到阈值时，会触发回调函数。

回调函数

`IntersectionObserver` 实例执行回调函数时，会传递一个包含 `IntersectionObserverEntry` 对象的数组，该对象一共有七大属性：

`time`：返回一个记录从 `IntersectionObserver` 的时间原点到交叉被触发的时间的时间戳；
`target`：目标元素；
`rootBounds`：祖先元素的矩形区域信息；
`boundingClientRect`：目标元素的矩形区域信息，与前面提到的 `Element.getBoundingClientRect()` 方法效果一致；
`intersectionRect`：祖先元素与目标元素相交区域信息；
`intersectionRatio`：返回 `intersectionRect` 与 `boundingClientRect` 的比例值；
`isIntersecting`：目标元素是否与祖先元素相交。

`IntersectionObserver` 实例方法

`observe`：开始监听一个目标元素；
`unobserve`：停止监听特定的元素；
`disconnect`：使 `IntersectionObserver` 对象停止监听工作；
`takeRecords`：为所有监听目标返回一个 `IntersectionObserverEntry` 对象数组并且停止监听这些目标。

React中使用
[使用 React + IntersectionObserver 实现图片懒加载](https://juejin.cn/post/6976493983472025614)