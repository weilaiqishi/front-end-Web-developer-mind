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

用伪代码表示该结构，如下：

```js
// 全局词法环境
GlobalEnvironment = {
    outer: null, //全局环境的外部环境引用为null
    GlobalEnvironmentRecord: {
        //全局this绑定指向全局对象
        [[Global	ThisValue]]: ObjectEnvironmentRecord[[BindingObject]],
        //声明式环境记录，除了全局函数和var，其他声明都绑定在这里
        DeclarativeEnvironmentRecord: {
            x: 1,
            y: 5
        },
        //对象式环境记录，绑定对象为全局对象
        ObjectEnvironmentRecord: {
            a: 2,
            foo:<< function>>,
            baz:<< function>>,
            isNaNl:<< function>>,
            isFinite: << function>>,
            parseInt: << function>>,
            parseFloat: << function>>,
            Array: << construct function>>,
            Object: << construct function>>
            ...
            ...
        }
    }
}
//foo函数词法环境
fooFunctionEnviroment = {
    outer: GlobalEnvironment,//外部词法环境引用指向全局环境
    FunctionEnvironmentRecord: {
        [[ThisValue]]: GlobalEnvironment,//this绑定指向全局环境
        bar:<< function>> 
    }
}
//bar函数词法环境
barFunctionEnviroment = {
    outer: fooFunctionEnviroment,//外部词法环境引用指向foo函数词法环境
    FunctionEnvironmentRecord: {
        [[ThisValue]]: GlobalEnvironment,//this绑定指向全局环境
        b: 3
    }
}

//baz函数词法环境
bazFunctionEnviroment = {
    outer: GlobalEnvironment,//外部词法环境引用指向全局环境
    FunctionEnvironmentRecord: {
        [[ThisValue]]: GlobalEnvironment,//this绑定指向全局环境
        a: 10
    }
}
```

个词法环境都有一个outer指向上一层的词法环境，当运行上面代码，函数bar的词法环境里没有变量a，所以就会到它的上一层词法环境（foo函数词法环境）里去找，foo函数词法环境里也没有变量a，就接着去foo函数词法环境的上一层（全局词法环境）去找，在全局词法环境里var a=2，沿着outer一层一层词法环境找变量的值就是 `作用域链` 。

在沿着作用域链向上找变量的时候（代码执行时的 `标识符解析` 是通过沿作用域链 `逐级搜索标识符名称` 完成），找到第一个就停止往上找，如果到全局词法环境里还是没有找到，因为全局词法环境里的outer是null，没办法再往上找，就会报ReferenceError。

内部上下文可以通过作用域链访问外部上下文中的一切，外部上下文无法访问内部上下文的任何东西。上下文之间的连接是线性的/有序的，函数参数被认为是当前上下文中的变量，因此也跟上下文中的其他变量遵循相同的访问规则

## 执行上下文

以执行上下文的角度看代码执行

1. 在全局代码执行前，JS引擎会创建一个栈来存储管理所有的执行上下文对象
2. 在全局执行上下文window确定后，将其添加到栈中（压栈）
3. 调用函数的时候，函数执行上下文创建后，将其添加到栈中（压栈）
4. 在当前函数执行完后将栈顶的对象移除（出栈）
5. 当所有的代码执行完后，栈中只剩下window

> 如此，我们便理解了递归为什么会栈溢出了。递归函数不断调用自身，但函数之间互不影响，又因为第一个调用的函数并没有结束，因此不会出栈。这样的话会不断地产生不同的函数执行上下文栈，不断地压栈，当栈的数量太多的时候，就会产生栈溢出。

### 执行上下文的组成和分类

![执行上下文的组成](https://pic1.zhimg.com/80/v2-1be8b90567e2dcaef3438616b7462c3c_720w.jpg)

LexicalEnvironment：词法环境组件
VariableEnvironment：变量环境组件
ThisBinding：这个就是代码里常用的this。在全局执行上下文中，this总是指向全局对象，例如浏览器环境下this指向window对象。而在函数执行上下文中，this的值取决于函数的调用方式，如果被一个对象调用，那么this指向这个对象。否则this一般指向全局对象window或者undefined（严格模式）。

在ES3概念中，存在变量对象的概念，Variable Object, 简称 VO，本质上就是一个对象：{key : value}形式存在，后被词法环境组件、变量环境组件取代，两者大体相同

**变量环境组件（VariableEnvironment）和词法环境组件（LexicalEnvironment）的区别**
两者都是Lexical Environment，但是变量环境组件（VariableEnvironment）是用来登记var function变量声明，词法环境组件（LexicalEnvironment）是用来登记let const class等变量声明。在ES6之前都没有块级作用域，ES6之后我们可以用let const来声明块级作用域，有这两个词法环境是为了实现块级作用域的同时不影响var变量声明和函数声明。具体操作如下：

1. 首先在一个正在运行的执行上下文内，词法环境由LexicalEnvironment和VariableEnvironment构成，用来登记所有的变量声明。
2. 当执行到块级代码时候，会先LexicalEnvironment记录下来，记录为oldEnv。
3. 创建一个新的LexicalEnvironment（outer指向oldEnv），记录为newEnv，并将newEnv设置为正在执行上下文的LexicalEnvironment。
4. 块级代码内的let const会登记在newEnv里面，但是var声明和函数声明还是登记在原来的VariableEnvironment里。
5. 块级代码执行结束后，将oldEnv还原为正在执行上下文的LexicalEnvironment。

注意：块级代码内的函数声明会被当做var声明，会被提升至外部环境，块级代码运行前其值为初始值undefined。

用伪代码来描述

```js
let a = 20;  
const b = 30;  
var c;

function multiply(e, f) {  
 var g = 20;  
 return e * f * g;  
}

c = multiply(20, 30);
```

```js
//全局执行上下文
GlobalExectionContext = {
    // this绑定为全局对象
    ThisBinding: <Global Object>,
    // 词法环境
    LexicalEnvironment: {  
        //环境记录
      EnvironmentRecord: {  
        Type: "Object",  // 对象环境记录
        // 标识符绑定在这里 let const创建的变量a b在这
        a: < uninitialized >,  
        b: < uninitialized >,  
        multiply: < func >  
      }
      // 全局环境外部环境引入为null
      outer: <null>  
    },
  
    VariableEnvironment: {  
      EnvironmentRecord: {  
        Type: "Object",  // 对象环境记录
        // 标识符绑定在这里  var创建的c在这
        c: undefined,  
      }
      // 全局环境外部环境引入为null
      outer: <null>  
    }  
  }

  // 函数执行上下文
  FunctionExectionContext = {
     //由于函数是默认调用 this绑定同样是全局对象
    ThisBinding: <Global Object>,
    // 词法环境
    LexicalEnvironment: {  
      EnvironmentRecord: {  
        Type: "Declarative",  // 声明性环境记录
        // 标识符绑定在这里  arguments对象在这
        Arguments: {0: 20, 1: 30, length: 2},  
      },  
      // 外部环境引入记录为</Global>
      outer: <GlobalEnvironment>  
    },
  
    VariableEnvironment: {  
      EnvironmentRecord: {  
        Type: "Declarative",  // 声明性环境记录
        // 标识符绑定在这里  var创建的g在这
        g: undefined  
      },  
      // 外部环境引入记录为</Global>
      outer: <GlobalEnvironment>  
    }  
  }
```

### var let const 全局变量

1.使用var的函数作用域声明

在使用var声明变量时，变量会被自动添加到最接近的上下文。

在函数中，最接近的上下文就是函数的局部上下文。在with语句中，最接近的上下文也是函数上下文。如果变量未经声明就被初始化了。那么它就会自动被添加到全局上下文

var声明会被拿到函数或全局作用域的顶部，位于作用域中所有代码之前。这个现象叫做 “提升”（hoisting）。

2.使用let的块级作用域声明

块级作用域由最近的一对包含花括号{}界定。换句话说，if块/while块/function块，甚至单独的块也是let声明变量的作用域

let与var的另一个不同之处是在同一作用域内不能声明两次。重复的var声明会被忽略，而重复的let声明会抛出SyntaxError

let的行为非常适合在循环中声明迭代变量。使用var声明的迭代变量会泄露到循环外部。

严格来讲，let在JavaScript运行时中也会被提升，但由于  “暂时性死区”（temporal dead zone）的缘故，实际上不能在声明之前使用 let 变量。因此，从写 JavaScript 代码的角度说，let 的提升跟 var是不一样的。

3.使用 const 的常量声明

使用 const 声明的变量必须同时初始化为某个值。一经声明，在其生命周期的任何时候都不能再重新赋予新值。

赋值为对象的 const 变量不能再被重新赋值为其他引用值，但对象的键则不受限制。

如果想让整个对象都不能修改，可以使用 Object.freeze()，这样再给属性赋值时虽然不会报错，但会静默失败

由于 const 声明暗示变量的值是单一类型且不可修改，JavaScript 运行时编译器可以将其所有实例都替换成实际的值，而不会通过查询表进行变量查找。谷歌的 V8 引擎就执行这种优化。

开发实践表明，如果开发流程并不会因此而受很大影响，就应该尽可能地多使用const 声明，除非确实需要一个将来会重新赋值的变量。这样可以从根本上保证提前发现重新赋值导致的 bug。

4.标识符查找
当在特定上下文中为读取或写入而引用一个标识符时，必须通过搜索确定这个标识符表示什么。

搜索开始于作用域链前端，以给定的名称搜索对应的标识符。
如果在局部上下文中找到该标识符，则搜索停止，变量确定；
如果没有找到变量名，则继续沿作用域链搜索。
（注意，作用域链中的对象也有一个原型链，因此搜索可能涉及每个对象的原型链。）
这个过程一直持续到搜索至全局上下文的变量对象。如果仍然没有找到标识符，则说明其未声明。

标识符查找并非没有代价。访问局部变量比访问全局变量要快，因为不用切换作用域。不过，JavaScript 引擎在优化标识符查找上做了很多工作，将来这个差异可能就微不足道了。

#### 提升

<https://www.jianshu.com/p/0f49c88cf169>

提升的本质是JS 变量的「创建create、初始化initialize 和赋值assign」

let 的「创建」过程被提升了，但是初始化没有提升。
var 的「创建」和「初始化」都被提升了。
function 的「创建」「初始化」和「赋值」都被提升了。

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

### 执行上下文生命周期

创建 -> 执行 -> 回收

创建阶段

- 确定this
- 创建词法环境组件（LexicalEnvironment）、创建变量环境组件（VariableEnvironment）
  包含 创建作用域链、`参数传递`(函数执行上下文)、变量预解析（变量提升） 和 函数预解析（函数提升）

执行阶段：执行代码，随着函数执行，修改 `AO` 的值

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

## this

与其他语言相比，**函数的 `this` 关键字**在 JavaScript 中的表现略有不同

在绝大多数情况下，函数的调用方式决定了 `this` 的值（运行时绑定）。`this` 不能在执行期间被赋值，并且在每次函数被调用时 `this` 的值也可能会不同。ES5 引入了 `bind` 方法来设置函数的 this 值，而不用考虑函数如何被调用的。ES2015 引入了`箭头函数`，箭头函数不提供自身的 this 绑定（this 的值将保持为闭合词法上下文的值）。

- 无论是否在严格模式下，在全局执行环境中（在任何函数体外部）this 都指向全局对象
- 在函数内部，this的值取决于函数被调用的方式。不在严格模式下，this 的值默认指向全局对象。在严格模式下，如果进入执行环境时没有设置 this 的值，this 会保持为 undefined。
- this 在 `类` 中的表现与在函数中类似，因为类本质上也是函数，但也有一些区别和注意事项。在类的构造函数中，this 是一个常规对象。类中所有非静态的方法都会被添加到 this 的原型中。`派生类` 不像基类的构造函数，派生类的构造函数没有初始的 this 绑定。在构造函数中调用 `super()` 会生成一个 this 绑定。

### call/apply/bind

`call()` 方法使用一个指定的 this 值和单独给出的一个或多个参数来调用一个函数。
该方法的语法和作用与 apply() 方法类似，只有一个区别，就是 call() 方法接受的是一个参数列表，而 `apply()` 方法接受的是`一个包含多个参数的数组`。

`bind` function.bind(thisArg[, arg1[, arg2[, ...]]])

1. 如果 bind 函数的参数列表为空，执行作用域的 this 将被视为新函数的 thisArg
2. 如果使用new运算符构造绑定函数，则忽略该值
3. 当使用 bind 在 setTimeout 中创建一个函数（作为回调提供）时，
作为 thisArg 传递的任何原始值都将转换为 object

使用示例

**创建绑定函数**

```js
this.x = 9;    // 在浏览器中，this 指向全局的 "window" 对象
var module = {
  x: 81,
  getX: function() { return this.x; }
};

module.getX(); // 81

var retrieveX = module.getX;
retrieveX();
// 返回 9 - 因为函数是在全局作用域中调用的

// 创建一个新函数，把 'this' 绑定到 module 对象
// 新手可能会将全局变量 x 与 module 的属性 x 混淆
var boundGetX = retrieveX.bind(module);
boundGetX(); // 81
```

**偏函数**
使一个函数拥有预设的初始参数

```js
function addArguments(arg1, arg2) {
    return arg1 + arg2
}
var result1 = addArguments(1, 2); // 3

// 创建一个函数，它拥有预设的第一个参数
var addThirtySeven = addArguments.bind(null, 37); 
var result2 = addThirtySeven(5); 
// 37 + 5 = 42 
var result3 = addThirtySeven(5, 10);
// 37 + 5 = 42 ，第二个参数被忽略
```

**构造函数偏函数**
bind时提供的thisArg会被忽略

```js
function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.toString = function() {
  return this.x + ',' + this.y;
};

var p = new Point(1, 2);
p.toString(); // '1,2'

var bindFn = Point.bind(null, 0/*x*/)
var bindFnEntity = new bindFn(5)
console.log(bindFn1Entity.toString(), // '0,5')
```

[手写callapplybind](../1html&js/jscode/callapplybind.js)

### 确定this

1. 如果有new关键字，this指向new出来的那个对象
2. 箭头函数中的 this 取决包裹箭头函数的第一个普通函数的 this，全局代码中为全局对象，箭头函数不能被 new (Uncaught TypeError: xxx is not a constructor)。如果将this传递给call、bind、或者apply，它将被忽略，不过仍然可以为调用添加参数
3. call/apply/bind，手动改变this指向
4. 最后普通函数调用，this指向调用该函数的对象，函数括号执行前面没跟对象，this就是全局对象，严格模式为undefined

事件相关

1.在事件中，this指向触发这个事件的对象， 特殊的是，IE中的attachEvent中的this总是指向全局对象Window

2.作为一个内联事件处理函数（html里写监听事件），当代码被内联on-event 处理函数调用时，它的this指向监听器所在的DOM元素

例 alert 会显示button

```html
<button
  onclick="alert(this.tagName.toLowerCase());">
  Show this
</button>
```

3.作为一个DOM事件处理函数（js里写监听事件），它的this指向触发事件的元素

```js
// 被调用时，将关联的元素变成蓝色
function bluify(e){
  console.log(this === e.currentTarget); // 总是true
  this.style.backgroundColor = '#A5D9F3';
}

// 获取文档中的所有元素的列表
var elements = document.getElementsByTagName('*');

// 将bluify作为元素的点击监听函数，当元素被点击时，就会变成蓝色
for(var i=0 ; i<elements.length ; i++){
  elements[i].addEventListener('click', bluify, false);
}
```

> target是事件触发的真实元素，currentTarget是事件绑定的元素，事件处理函数中的this指向是中为currentTarget。currentTarget和target，有时候是同一个元素，有时候不是同一个元素 （因为事件冒泡）
当事件是子元素触发时，currentTarget为绑定事件的元素，target为子元素。当事件是元素自身触发时，currentTarget和target为同一个元素。
