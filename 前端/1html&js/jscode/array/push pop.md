# 实现数组 push、pop 方法

原文 <https://juejin.cn/post/6844903986479251464#heading-27>

参照 ecma262 草案的规定，关于 push 和 pop 的规范如下图所示:

![push](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/3/16e311f4fa483cc2~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)
![pop](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/3/16e311fa338c2ecb~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)

```js
Array.prototype.push = function(...items) {
  let O = Object(this);
  let len = this.length >>> 0;
  let argCount = items.length >>> 0;
  // 2 ** 53 - 1 为JS能表示的最大正整数
  if (len + argCount > 2 ** 53 - 1) {
    throw new TypeError("The number of array is over the max value restricted!")
  }
  for(let i = 0; i < argCount; i++) {
    O[len + i] = items[i];
  }
  let newLength = len + argCount;
  O.length = newLength;
  return newLength;
}
```

```js
Array.prototype.pop = function() {
  let O = Object(this);
  let len = this.length >>> 0;
  if (len === 0) {
    O.length = 0;
    return undefined;
  }
  len --;
  let value = O[len];
  delete O[len];
  O.length = len;
  return value;
}
```
