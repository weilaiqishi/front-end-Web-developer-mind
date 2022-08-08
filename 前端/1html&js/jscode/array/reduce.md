# 实现数组reduce方法

原文 <https://juejin.cn/post/6844903986479251464#heading-26>

依照 [ecma262 草案](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/3/16e311ed2bfa8fad~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)，实现的reduce的规范如下:

其中有几个核心要点:

1、初始值不传怎么处理
2、回调函数的参数有哪些，返回值如何处理。

```js
Array.prototype.reduce  = function(callbackfn, initialValue) {
  // 异常处理，和 map 一样
  // 处理数组类型异常
  if (this === null || this === undefined) {
    throw new TypeError("Cannot read property 'reduce' of null or undefined");
  }
  // 处理回调类型异常
  if (Object.prototype.toString.call(callbackfn) != "[object Function]") {
    throw new TypeError(callbackfn + ' is not a function')
  }
  let O = Object(this);
  let len = O.length >>> 0;
  let k = 0;
  let accumulator = initialValue;
  if (accumulator === undefined) {
    for(; k < len ; k++) {
      // 查找原型链
      if (k in O) {
        accumulator = O[k];
        k++;
        break;
      }
    }
  }
  // 表示数组全为空
  if(k === len && accumulator === undefined) 
    throw new Error('Each element of the array is empty');
  console.log(k)
  for(;k < len; k++) {
    if (k in O) {
      // 注意，核心！
      accumulator = callbackfn.call(undefined, accumulator, O[k], k, O);
    }
  }
  return accumulator;
}
```
