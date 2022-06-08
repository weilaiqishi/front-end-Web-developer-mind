# js原理-执行上下文与作用域

**名词介绍**
ECStack: `Execution Context Stack`,执行环境栈；
EC: `EC(G)`全局执行上下文, `EC(fn)`函数执行上下文。 `EC(block)`块级执行上下文
VO: `Variable Object`变量对象
AO: `Active Object`活动变量对象
GO: `Global Object`全局对象

**JS运行关键点**：单线程、同步执行、一个全局上下文、每次函数调用创建新的上下文

**JavaScript运行流程**
![JavaScript运行流程](https://img-blog.csdnimg.cn/b1156a927075460fa529d6bde0596150.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAY29kZXJAaHU=,size_20,color_FFFFFF,t_70,g_se,x_16)

全局预编译(脚本代码块script执行前)

1. 查找全局变量声明（包括隐式全局变量声明，省略var声明），变量名作全局对象的属性，值为undefined
2. 查找函数声明，函数名作为全局对象的属性，值为函数引用

预编译与执行

1. 语法分析
   语法分析就是引擎检查代码有没有什么低级的语法错误
2. 函数预编译(函数执行前)
   在内存中开辟一些空间，存放一些变量与函数
   1. 创建 `AO对象（Active Object）`
   2. 查找 `函数形参` 及 `函数内变量声明`，形参名及变量名作为 `AO对象` 的属性，值为undefined
   3. 实参形参相统一，实参值赋给形参
   4. 查找 `函数声明`，函数名作为AO对象的属性，值为函数引用
3. 解释执行
   执行代码

**VO/AO**
`VO(变量对象)`, 也就是 `variable object` , 创建执行上下文时与之关联的会有一个变量对象，该上下文中的所有变量和函数全都保存在这个对象中。
`AO(活动对象)`, 也就是`activation object`,进入到一个执行上下文时，此执行上下文中的变量和函数都可以被访问到，可以理解为被激活了。

活动对象和变量对象的区别在于:
变量对象（VO）是规范上或者是JS引擎上实现的，并不能在JS环境中直接访问。
当进入到一个执行上下文后，这个变量对象才会被激活，所以叫活动对象（AO），这时候活动对象上的各种属性才能被访问。

## 词法环境 Lexical Environment

[[笔记] Javascript：词法环境与执行上下文](https://zhuanlan.zhihu.com/p/504883851)

`Lexical Environment（词法环境）`：即是登记变量声明、函数声明、函数声明的形参的地方或环境，后续代码执行的时候就知道去哪里拿变量的值和函数了。

词法环境有两个组成部分：
![词法环境有两个组成部分](https://pic2.zhimg.com/v2-7664e7b8e7c47f93114610a9eb1fcfa5_r.jpg)

- 1：`环境记录（Environment Record）`，这个就是真正登记变量的地方。
  - 1.1：`声明式环境记录（Declarative Environment Record）`：用来记录直接有标识符定义的元素，比如变量、常量、let、class、module、import以及函数声明。
  - 1.2：`对象式环境记录（Object Environment Record）`：主要用于with和global的词法环境。
- 2：`对外部词法环境的引用（outer）`，它是作用域链能够连起来的关键。
其中 声明式环境记录（Declarative Environment Record），又分为两种类型：

`函数环境记录（Function Environment Record）`：用于函数作用域。
`模块环境记录（Module Environment Record）`：模块环境记录用于体现一个模块的外部作用域，即模块export所在环境。

![词法环境](https://pic1.zhimg.com/80/v2-26da19b9accb068134d68bb843357cb8_720w.jpg)

## 执行上下文

1. 
   
2. **执行上下文组成**：

   ```js
   executionContextObj = {
     this,
     vo: 变量对象
     scopeChain: 作用域链，跟闭包相关
   }
   ```

### 高程4.2 执行上下文与作用域
   每个上下文都有一个关联的 `变量对象 (variable object)`
   而这个上下文中定义的所有变量和函数都存在这个对象上。无法通过代码访问变量对象
3. 全局上下文是最外层的上下文。根据ECMAScript实现的宿主环境，表示全局上下文的对象可能不一样
   在浏览器中，全局上下文就是我们常说的window对象（第12章会详细介绍），
   所有通过var定义的全局变量和函数都会成为window对象的属性和方法
   使用let和const的顶级声明不会定义在全局上下文中，但在作用域解析上效果是一样的
4. 上下文在其所有代码都执行完毕后会销毁，包括定义在它上面的所有变量和函数
  （全局上下文在应用程序退出前才会销毁，比如关闭网页或退出浏览器）
   每个函数调用都有自己的上下文。当代码执行流进入函数时，函数的上下文被推到一个上下文栈
   在函数执行完之后，上下文栈会弹出该函数上下文，将控制权返回给之前的执行上下文。
   程序执行流就是通过这个上下文栈进行控制的
5. 上下文中的代码在执行的时候，会创建变量对象的一个 `作用域链（scope chain）`
   这个作用域链据决定了各级上下文的代码在访问变量和函数时的顺序
   代码正在执行的上下文的变量对象始终位于作用域链的最前端
   作用域链中的下一个变量对象来自包含上下文，再下一个对象来自再下一个包含上下文，
   以此类推至全局上下文。全局上下文的变量对象始终是作用域链的最后一个变量对象
   如果上下文是函数，则其 `活动对象 （activation object）`用作变量对象。
   活动对象最初只有一个定义变量:arguments(全局上下文没有)
6. 代码执行时的 `标识符解析` 是通过沿作用域链 `逐级搜索标识符名称` 完成的（变量或函数）。
   搜索过程始终从作用域链的最前端开始，然后逐级往后，直到找到标志符（没有找到就报错）
   内部上下文可以通过作用域链访问外部上下文中的一切，
   外部上下文无法访问内部上下文的任何东西。
   上下文之间的连接是线性的/有序的
   函数参数被认为是当前上下文中的变量，
   因此也跟上下文中的其他变量遵循相同的访问规则
7. 4.2.1 作用域链增强
   虽然执行上下文主要有 `全局上下文` 和 `函数上下文` 两种（eval()调用内部存在第三种上下文）
   但有其他方式来增强作用域链。
   `with` 语句会向作用域链前端添加指定的对象
   `catch` 语句会创建一个新的变量对象，这个变量对象会包含要抛出的错误对象的声明

### 执行上下文运行步骤

**创建阶段**

1. 初始化作用域链
2. 创建变量对象
   创建arguments
   扫描函数声明
   扫描变量声明
3. 求this

**执行阶段**：执行代码，随着函数执行，修改 `AO` 的值

#### 示例

看以下这段代码

```js
var scope = "global scope";
function checkscope(a){
    var scope2 = 'local scope';
}
checkscope(5);
```

1. 创建全局上下文执行栈：创建 `全局变量globalContext.VO`
2. 创建checkscope函数：
   将 `全局变量VO` 保存为 `作用域链` ，
   设置到函数的 `内部属性[[scope]]`

   ```js
   checkscope.[[scope]] = [
     globalContext.VO
   ]
   ```

3. 准备执行checkscope函数，创建函数执行上下文：
   - 第一步是复制[[scope]]，创建作用域链

     ```js
     checkscopeContext = {
       Scope: checkscope.[[scope]],
     }
     ```

   - 第二步是创建活动对象AO

     ```js
     checkscopeContext = {
       AO: {
         arguments: {
           0: 5
           length: 1
         },
         a: 5
         scope2: undefined
       },
       Scope: checkscope.[[scope]],
     }
     ```

   - 第三步是将活动对象AO放入作用域链顶端

     ```js
     checkscopeContext = {
       AO: {
         arguments: {
           0: 5
           length: 1
         },
         a: 5
         scope2: undefined
       },
       Scope: [AO, checkscope.[[scope]]],
     }
     ```

   - 第四步，求出this，上下文创建阶段结束
     这里的this等于window

   将checkscope函数执行上下文压入执行上下文栈

   ```js
   ECStack = [
     checkscopeContext,
     globalContext
   ]
   ```

4. 进入函数执行阶段：随着函数执行，修改AO的值

   ```js
   AO: {
     arguments: {
       0: 5
       length: 1
     },
     a: 5
     scope2: 'local scope'
   }
   ```

5. 函数执行完毕：函数上下文从执行上下文栈弹出

   ```js
   ECStack = [
     globalContext
   ]
   ```

## 作用域链

### 词法作用域(静态作用域)

JS的函数运行在他们被定义的作用域中，而不是他们被执行的作用域
跟this不同，this可以改，作用域不能改
例子

```js
var s = 3
function a () {
  console.log(s)
}
function b () {
  var s = 6
  a()
}
b() // 3,不是6
```

如果js采用动态作用域，
打印出来的应该是6而不是3，
这个例子说明了js是静态作用域
[动态作用域更多介绍](http://www.yinwang.org/blog-cn/2013/03/26/lisp-dead-alive)

### 作用域

变量与函数的可访问范围,控制着变量及函数的可见性与生命周期

**全局作用域**
在代码任何地方都能访问到的对象拥有全局作用域
3种情形会拥有全局作用域

1. 最外层函数以及最外层定义的变量
2. 任何地方隐式定义的变量（未定义直接赋值的变量）
3. 全局对象的属性

**局部作用域/函数作用域**
在一个函数中定义的变量只对这个函数内部可见，其生命周期随着函数的执行结束而结束

**块级作用域**
在ES6中提出块级作用域概念,它的用途就是:变量的声明应该距离使用的地方越近越好。并最大限度的本地化。避免污染。

**动态作用域**
与词法作用域不同于在定义时确定，`动态作用域在执行时确定，其生存周期到代码片段执行为止` 。动态变量存在于动态作用域中，任何给定的绑定的值，在确定调用其函数之前，都是不可知的。
从某种程度上来说,这会修改作用域,（也就是欺骗）词法作用域。在你的代码中建议不要使用它们,这是因为在某些方面: `欺骗词法作用域会导致更低下的性能` 。`eval` 和 `with` 都可以欺骗编写时定义的词法作用域。

**作用域链**
**概念**
函数在定义的时候，把 `父级的变量对象AO/VO` 的集合保存在内部属性 `[[scope]]` 中，该集合称为作用域链
**作用**
当函数需要访问不在函数内部声明的变量，会顺着作用域链来查找数据
子函数会一级一级的向上查找父函数的变量，
父函数的变量对子对象是可见的，反之不成立。
**示例**

```js
function foo() {
    function bar() {
        ...
    }
}

// foo.[[scope]] = [
//   globalContext.VO
// ]

// bar.[[scope]] = [
//     fooContext.AO,
//     globalContext.VO
// ]
```

## 闭包

**mdn定义**
可以访问自由变量的函数（子函数）。自由变量前面提到过，指的是不在函数内部声明的变量

**闭包的形式**

```js
function a() {
 var num = 1
 function b() {
  console.log(num++)
 }
 return b
}
var c1 = a()
c1() // '1'
c1() // '2'
var c2 = a()
c2() // '1'
c2() // '2'
```

c2所访问num变量跟c1访问的num变量不是同一个变量
闭包所访问的变量，是每次运行父函数都重新创建，互相独立的
同一个函数中创建的自由变量是可以在不同的闭包共享的

执行过程

1. 运行函数a
  1.创建函数a的VO，包括变量num和函数b
  2.定义函数b的时候，会保存a的变量对象VO和 全局变量对象到[[scope]]中
  3.返回函数b，保存到c1
2. 运行c1
  1.创建c1的作用域链，该作用域链保存了a的变量对象VO
  2.创建c1的VO
  3.运行c1，这是发现需要访问变量num，在当前VO中不存在，于是通过作用域链进行访问，找到了保存在a的VO中的num，console.log后num的值被设置成2
3. 再次运行c1，重复第二步的操作，console.log后num的值设置成3

**chrome控制台查看作用域链和闭包**
![执行栈（Call Stack）](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eafeba8d0e2b436badb299526252c80c~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)
![闭包（Closure）](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/648bb0f05ad445c6a56f4dda7d6a2b21~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)
![作用域链（scope）](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4eabaacccb3480396cae22897678044~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)

**经典面试题**
循环中使用闭包解决 var 定义函数的问题

```js
for (var i = 1; i <= 5; i++) {
  setTimeout(function timer() {
    console.log(i)
  }, i * 1000)
}
```

首先因为 setTimeout 是个异步函数，
所以会先把循环全部执行完毕，
这时候 i就是 6 了，所以会输出一堆 6

解决办法三种

第一种是使用闭包的方式

```js
for (var i = 1; i <= 5; i++) {
  (function(j) {
    setTimeout(function timer() {
      console.log(j);
    }, j * 1000);
  })(i);
}
```

在上述代码中，我们首先使用了立即执行函数将 i 传入函数内部，
这个时候值就被固定在了参数 j 上面不会改变，
当下次执行 timer 这个闭包的时候，就可以使用外部函数的变量 j

第二种就是使用 setTimeout 的第三个参数，
这个参数会被当成 timer 函数的参数传入

```js
for (var i = 1; i <= 5; i++) {
  setTimeout(
    function timer(j) {
      console.log(j)
    },
    i * 1000,
    i
  )
}
```

第三种就是使用 let 定义 i 了来解决问题了，
这个也是最为推荐的方式

```js
for (let i = 1; i <= 5; i++) {
  setTimeout(function timer() {
    console.log(i)
  }, i * 1000)
}
```

## var let const 全局变量

题目

```js
function test (a,c) {
  console.log(a, b, c, d) // 5 undefined [Function: c] undefined
  var b = 3;
  a = 4
  function c () {
  }
  var d = function () {
  }
  console.log(a, b, c, d) // 4 3 [Function: c] [Function: d]
  var c = 5
  console.log(a, b, c, d) // 4 3 5 [Function: d]
}
test(5,6)
```

函数变量a, c：创建 初始化 赋值
函数声明c：创建 初始化 赋值
var b c d：创建 初始化
c已存在， var一个存在的变量会失效，不用创建初始化，只剩下等到语句执行到时赋值
