# js 代码压缩 minify 的原理是什么

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

通过 AST 分析，根据选项配置一些策略，来生成一颗更小体积的 AST 并生成代码。

目前前端工程化中使用 `terser` 和 `swc` 进行 JS 代码压缩，他们拥有相同的 API。

常见用以压缩 AST 的几种方案如下:

## 去除多余字符: 空格，换行及注释

```js
// 对两个数求和
function sum (a, b) {
  return a + b;
}
```

此时文件大小是 62 Byte， 一般来说中文会占用更大的空间。
多余的空白字符会占用大量的体积，如空格，换行符，另外注释也会占用文件体积。当我们把所有的空白符合注释都去掉之后，代码体积会得到减少。
去掉多余字符之后，文件大小已经变为 30 Byte。 压缩后代码如下:

```js
function sum(a,b){return a+b}
```

替换掉多余字符后会有什么问题产生呢？

有，比如多行代码压缩到一行时要注意行尾分号。

## 压缩变量名：变量名，函数名及属性名

```js
function sum (first, second) {
  return first + second;  
}
```

如以上 first 与 second 在函数的作用域中，在作用域外不会引用它，此时可以让它们的变量名称更短。但是如果这是一个 module 中，sum 这个函数也不会被导出呢？那可以把这个函数名也缩短。

```js
// 压缩: 缩短变量名
function sum (x, y) {
  return x + y;  
}

// 再压缩: 去除空余字符
function s(x,y){return x+y}
```

在这个示例中，当完成代码压缩 (compress) 时，代码的混淆 (mangle) 也捎带完成。 **但此时缩短变量的命名也需要 AST 支持，不至于在作用域中造成命名冲突。**

## 解析程序逻辑：合并声明以及布尔值简化

通过分析代码逻辑，可对代码改写为更精简的形式。

合并声明的示例如下：

```js
// 压缩前
const a = 3;
const b = 4;

// 压缩后
const a = 3, b = 4;
```

布尔值简化的示例如下：

```js
// 压缩前
!b && !c && !d && !e

// 压缩后
!(b||c||d||e)
```

## 解析程序逻辑: 编译预计算

在编译期进行计算，减少运行时的计算量，如下示例:

```js
// 压缩前
const ONE_YEAR = 365 * 24 * 60 * 60

// 压缩后
const ONE_YAAR = 31536000
```

```js
// 压缩前
function hello () {
  console.log('hello, world')
}

hello()

// 压缩后
console.log('hello, world')
```
