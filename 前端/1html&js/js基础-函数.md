# js原理-函数

## 函数定义

`函数声明 (函数语句)`
`function name([param[, param[, ... param]]]) { statements }`
name 函数名
param 传递给函数的参数的名称，一个函数最多可以有255个参数
statements 组成函数体的声明语句

`函数表达式 (function expression)`
`var myFunction = function name([param[, param[, ... param]]]) { statements }`
当省略函数名的时候，该函数就成为了匿名函数。函数表达式里的函数名没有声明，不能在定义之前调用。

`箭头函数`、`generator函数`、`async函数`

## 函数参数

### arguments对象

arguments 是一个对应于传递给函数的参数的类数组对象
在使用箭头函数时，arguments 指向的对象并不是当前函数所属的argments，而是上级函数的arguments

arguments对象不是一个 Array，它类似于Array，但除了length属性和索引元素之外没有任何Array属性。例如，它没有 pop 方法。但是它可以被转换为一个真正的Array。

参数也可以被设置

```js
arguments[1] = 'new value';
```

属性

- arguments.callee 指向当前执行的函数
- arguments.length 指向传递给当前函数的参数数量
- arguments[@@iterator] 返回一个新的Array迭代器对象，该对象包含参数中每个索引的值

在严格模式下，arguments对象已与过往不同。arguments[@@iterator]不再与函数的实际形参之间共享，同时caller属性也被移除。

### 剩余参数、默认参数和解构赋值参数

es6默认参数: 函数默认参数允许在没有值或undefined被传入时使用默认形参

```js
function [name]([param1[ = defaultValue1 ][, ..., paramN[ = defaultValueN ]]]) { 
    statements 
}
```

es6剩余参数: 剩余参数语法允许我们将一个不定数量的参数表示为一个数组

```js
function(a, b, ...theArgs) {
  // ...
}

function sum(...theArgs) {
  return theArgs.reduce((previous, current) => {
    return previous + current;
  });
}
console.log(sum(1, 2, 3));
// expected output: 6
console.log(sum(1, 2, 3, 4));
// expected output: 10
```
