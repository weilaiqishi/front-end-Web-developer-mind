# js数据类型

[JavaScript 数据类型和数据结构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures#%E5%AF%B9%E8%B1%A1)

原始值（直接表示在语言底层的不可变数据）

- 布尔类型
- Null 类型
- Undefined 类型
- 数字类型
- BigInt 类型
- 字符串类型
- 符号类型

对象（一组属性的集合）（引用类型）

- “标准的”对象 一个 JavaScript 对象就是键和值之间的映射。键是一个字符串（或者 Symbol），值可以是任意类型的。这使得对象非常符合哈希表。
- 函数是一个附带可被调用功能的常规对象。
- 日期
- 有序集：数组和类型数组
- 带键的集合：Maps, Sets, WeakMaps, WeakSets
- 结构化数据：JSON
- 基本包装类型（Boolean、Number 和String）
- 单体内置对象（Global、Math）
[JavaScript 标准内置对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects)
错误对象 控制抽象对象(Promise/Generator/GeneratorFunction/AsyncFunction) 反射 国际化 WebAssembly 其他(arguments)

## 相关方法

### boolean

**Boolean包装对象**

```js
var test=new Boolean();
console.log(test);
var test=new Boolean(0);
console.log(test);
var test=new Boolean(null);
console.log(test);
var test=new Boolean("");
console.log(test);
var test=new Boolean(NaN);
console.log(test);
```

1. 没有内容就是undefined,这个就是false
2. 0就是false,1是true
3. null跟undefined一样,都是false
4. 字符串里面有内容的话才是true,没有内容就是false
5. NaN是一种数值类型,已经是false了,只是为了让程序继续往下面走
6. 其他解析: 数值只要不是0,都是true 对象object永远都是true

### null

**typeof  null // "object"而不是"null"**
这个bug是第一版Javascript留下来的。
在这个版本，数值是以32字节存储的，由标志位（1~3个字节）和数值组成。
标志位存储的是低位的数据。这里有五种标志位：
000：对象，数据是对象的应用。
1：整型，数据是31位带符号整数。
010：双精度类型，数据是双精度数字。
100：字符串，数据是字符串。
110：布尔类型，数据是布尔值。

### number

Math.ceil  天花板向上取整
Math.floor  地板向下取整
Math.round  附近四舍五入取整

### string

**介绍**

1. 字符串(string)是一组由16位值组成的不可变的有序序列，
每个字符通常来自于Unicode字符集，JavaScript字符串的索引从零开始。
在JavaScript程序中的字符串直接量，是由单引号或双引号包括起来的字符序列。
在ECMAScript3中，字符串直接量必须写在一行中，
而在ECMAScript5中，字符串直接量可以拆分成数行，
但每行必须以反斜线结束，反斜线和行结束符都不算是字符串直接量的内容。
2. 在ES5中，字符串可以当做只读数组，除了使用charAt()方法，
也可以使用方括号来访问字符串中的单个字符

**js中字符串连接方式较为高效的方法**
+的处理机制是：
  一个临时字符串，
  将新字符串赋值为a+b，
  然后返回这个临新字符串并同时销毁原始字符串，
所以字符串连接效率较低。
所以用Array.join()不会新建临时字符串效率更高。
（当然以上效率问题仅存在于低版本浏览器ie7-及以下，
现在的新浏览器基本上都解决了这个问题，效率差不多）

**判断字符串中是否包含某个字符串**
String对象的方法

- indexOf
- includes
- search。search() 方法用于检索字符串中指定的子字符串，或检索与正则表达式相匹配的子字符串。如果没有找到任何匹配的子串，则返回 -1。
- match。match() 方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。
RegExp 对象方法
- test。test() 方法用于检索字符串中指定的值。返回 true 或 false。
- exec() 方法用于检索字符串中的正则表达式的匹配。返回一个数组，其中存放匹配的结果。如果未找到匹配，则返回值为 null。

### symbol(es6)

**介绍**
Symbol是ES6新增的一种数据类型，表示独一无二的值，Symbol最大的用途是用来定义对象的唯一属性名。ES5的对象属性名都是字符串，容易造成属性名的冲突。如果使用了一个他人提供的对象，但又想为期添加新的方法，那么新方法的名字有可能与已有方法产生冲突。因此，需要保证每个属性的名字都是独一无二的，以防止属性名的冲突。这就是ES6引入Symbol的原因。

### 对象

**介绍**
原始类型存储的是值，
对象类型存储的是地址（指针）
他们都是栈内存
指针指向的是堆内存
> 一般来说
> 栈和堆的分配是指 C 或 C++ 编译的程序
> 通常有这几部分组成：
> 1、栈区（stack） 由编译器自动分配释放 ，存放函数的参数值，局部变量的值等
> 2、堆区（heap）一般由程序员分配释放，使用 malloc 或 new 等
> 3、全局区（静态区）（static）
> 4、常量区
> 5、程序代码区
>
> 但是由于JS脚本引擎是一种由 C 或 C++ 开发的“应用”
> 而且这种脚本“应用”并不再经过 C/C++ 编译器编译
> 所以这种“应用”内变量所处位置并不好说
>
> 因为这些变量可能只是 C 或 C++ 内结构体或者某种Script类型实例后结果
> 那么就可能是指的存放在堆区的
>
> 但是呢，具体怎么做取决与不同引擎的实现方式
> 当然，如果有 JIT 的
> 可推导出某Script内局部变量\参数为 C/C++内某种具体值类型的话
> 可能还是会放置在栈区的吧
> 其实写JS的应该压根不关心这个（这种层面上的栈/堆）
>
> 作者：貘吃馍香
> 链接：<https://www.zhihu.com/question/42231657/answer/102552732>

### Array

**介绍**
数组最多可以包含 4 294 967 295 个项（2的32次方 无符号整形最大值）

**原生具备 Iterator 接口的数据结构**

- Array
- Map
- Set
- String
- TypedArray
- 函数的 arguments 对象
- NodeList 对象

**循环数组中的空位**
ES5forEach(), filter(), reduce(), every() 和some()都会跳过空位。
map()会跳过空位，但会保留这个值
join()和toString()会将空位视为undefined，而undefined和null会被处理成空字符串。

**创建数组**
1.使用 Array 构造函数。

```js
var colors = new Array(20); // 创建 length 值为 20 的数组
var colors = new Array("red", "blue", "green"); // 创建了一个包含 3 个字符串值的数组
```

在使用 Array 构造函数时也可以省略 new 操作符

2.使用数组字面量表示法

```js
var values = [1,2,]; // 不要这样！这样会创建一个包含 2 或 3 项的数组
```

在 IE 中，values 会成为一个包含 3 个项且每项的值分别为 1、2 和 undefined 的数组；
在其他浏览器中，values 会成为一个包含 2 项且值分别为1 和 2 的数组。
原因是 IE8 及之前版本中的 ECMAScript 实现在数组字面量方面存在 bug。

3.将集合A转化为数组
`Array.from`
Array.from(arr, mapfn,thisArg)方法，
用于将两类可以把对象转换为真正的数组：
    类似数组的对象
    可遍历的对象（部署了Iterator接口的，String，ES6新增的Map和Set）。
可以传3个参数，
    其中第一个是数组，必传；
    第二个是一个函数（类似map函数），对数组元素进行操作后再返回数组，可选；
    第三个是对于this关键字的指向，可选。
`[].slice.apply(A)`
slice() 方法可从已有的数组中返回选定的元素（新数组）
`[…A]`
`[].map.call(A, o => o)`

**遍历**
forEach、every、some、filter、map、reduce、reduceRight 以及ES6新增的方法entries、find、findIndex、keys、values

**操作**
改变自身值的方法
pop、push、reverse、shift、sort、splice、unshift，以及两个ES6新增的方法copyWithin 和 fill

- `push` 、`pop` 和 `unshift` 、`shift`。改变原数组，`push` 、`pop` 是从数组的尾部进行增减，`unshift` 、`shift` 是从数组的头部进行增减，`push` 和 `unshift`向数组的尾部/头部添加若干元素，并返回数组的新长度。 `pop` 和 `shift` 从数组的尾部/头部删除1个元素(删且只删除1个)，并返回被删除的元素；空数组是继续删除，不报错，但返回undefined。
- `splice` 。绞接，改变原数组，如果需要删除数组中一个已存在的元素，可参考如下 `array.splice(array.indexOf('b'),1)`
- `slice` 。切， 不改变原数组，返回选定数组（新的数组对象）。
- `concat` 。将数组和(或)值连接成新数组，不改变原数组，返回新数组。
- `join` 。将数组变成字符串，不改变原数组，返回字符串。
- `sort` 。对数组进行排序，改变原数组，返回排序后的新数组。升序 `arr.sort((a, b) => { return a - b })`。v8引擎为了高效排序(采用了不稳定排序)。即数组长度超过10条时，会调用另一种排序方法(快速排序)；而10条及以下采用的是插入排序，此时结果将是稳定的。<https://juejin.cn/post/6844903476216987655>
- `toString` 。将数组中的元素用逗号拼接成字符串，不改变原数组，返回拼接后的字符串
- `reverse` 。反转数组，改变原数组，返回反转后的新数组

不会改变自身的方法
concat、join、slice、toString、toLocateString、indexOf、lastIndexOf、未标准的toSource以及ES7新增的方法includes

- `indexOf`。 从索引为0开始，检查数组中是否包含有value，有则返回匹配到的第一个索引，没有则返回-1
- `lastIndexOf` 。从最后的索引开始，检查数组找那个是否包含value，有则返回匹配到的第一个索引，没有返回-1
- `includes` 。包含则返回 true，否则返回false

**Array.prototype**
Array.prototype的所有方法
由于 Array.prototype 的某些属性被设置为[[DontEnum]]，因此不能用一般的方法进行遍历
我们可以通过如下方式获取 Array.prototype 的所有方法

```js
Object.getOwnPropertyNames(Array.prototype); // ['length', 'constructor', 'concat', 'copyWithin', 'fill', 'find', 'findIndex', 'lastIndexOf', 'pop', 'push', 'reverse', 'shift', 'unshift', 'slice', 'sort', 'splice', 'includes', 'indexOf', 'join', 'keys', 'entries', 'values', 'forEach', 'filter', 'flat', 'flatMap', 'map', 'every', 'some', 'reduce', 'reduceRight', 'toLocaleString', 'toString', 'at', 'findLast', 'findLastIndex'] // Edge 102
```

**Array**

- `Array.isArray` 。判断一个变量是否数组类型。es5可用 `Object.prototype.toString.call(arg) === '[object Array]'`。
- `Array.of` 。基本上与Array构造器功能一致， 唯一的区别就在单个数字参数的处理上
- `Array.from` 。一个对象有迭代器，Array.from就能把它变成一个数组（返回新的数组，不改变原对象）

#### 数组灵活运用

克隆数组
es6扩展运算符

```js
const _arr = [0, 1, 2];
const arr = [..._arr];
```

合并数组
es6扩展运算符

```js
const arr1 = [0, 1, 2];
const arr2 = [3, 4, 5];
const arr = [...arr1, ...arr2];
```

去重数组
es6 set

```js
const arr = [...new Set([0, 1, 1, null, null])];
// arr => [0, 1, null]
```

清空数组

```js
arr.length = 0
```

过滤空值

```js
const arr = [undefined, null, "", 0, false, NaN, 1, 2].filter(Boolean);
```

数组首部插入成员

```js
arr.unshift(0);
arr = [0].concat(arr);
arr = [0, ...arr];
```

数组尾部插入成员

```js
arr.push(2);
arr.concat(2);
arr[arr.length] = 2;
arr = [...arr, 2];
```

统计数组成员个数

```js
const arr = [0, 1, 1, 2, 2, 2];
const count = arr.reduce((t, c) => {
  t[c] = t[c] ? ++ t[c] : 1;
  return t;
}, {});
// count => { 0: 1, 1: 2, 2: 3 }
```

解构数组成员别名

```js
const arr = [0, 1, 2];
const { 0: a, 1: b, 2: c } = arr;
// a b c => 0 1 2
```

解构数组成员默认值

```js
const arr = [0, 1, 2];
const [a, b, c = 3, d = 4] = arr;
// a b c d => 0 1 2 4
```

并集，交集和差集
ES7 includes

```js
// 并集
let union = a.concat(b.filter(v => !a.includes(v))) // [1,2,3,4,5]
// 交集
let intersection = a.filter(v => b.includes(v)) // [2]
// 差集
let difference = a.concat(b).filter(v => a.includes(v) && !b.includes(v))
```

ES6 Array.from Set

```js
let aSet = new Set(a)
let bSet = new Set(b)
// 并集
let union = Array.from(new Set(a.concat(b))) // [1,2,3,4,5]
// 交集
let intersection = Array.from(new Set(a.filter(v => bSet.has(v)))// [2]
// 差集
let differenceNew = Array.from(new Set(a.concat(b).filter(v => aSet.has(v) && !bSet.has(v))) [1,3]
```

ES5 filter indexOf（indexOf方法中NaN永远返回-1）
不考虑NaN

```js
// 并集
var union = a.concat(b.filter(function(v) {
return a.indexOf(v) === -1})) // [1,2,3,4,5]
// 交集
var intersection = a.filter(function(v){ return b.indexOf(v) > -1 }) // [2]
// 差集
var difference = a.filter(function(v){ return b.indexOf(v) === -1 })// [1,3]
```

考虑NaN

```js
  var a = [1, 2, 3, NaN];
  var b = [2, 4, 5];
  var aHasNaN = a.some(function (v) {
    return isNaN(v)
  })
  var bHasNaN = b.some(function (v) {
    return isNaN(v)
  })
  // 并集
  var union = a.concat(b.filter(function (v) {
    return a.indexOf(v) === -1 && !isNaN(v)
  })).concat(!aHasNaN & bHasNaN ? [NaN] : []) // [1,2,3,4,5,NaN]
  // 交集
  var intersection = a.filter(function (v) {
    return b.indexOf(v) > -1
  }).concat(aHasNaN & bHasNaN ? [NaN] : []) // [2]
  // 差集
  var difference = a.filter(function (v) {
    return b.indexOf(v) === -1 && !isNaN(v)
  }).concat(aHasNaN && !bHasNaN ? [NaN] : [])//1,3,NaN
  console.log(union)
  console.log(intersection)
  console.log(difference
```

### Date

**介绍**
ECMAScript 中的 Date 类型是在早期 Java 中的 java.util.Date 类基础上构建的。为此，Date
类型使用自 UTC（Coordinated Universal Time，国际协调时间）1970 年 1 月 1 日午夜（零时）开始经过
的毫秒数来保存日期。在使用这种数据存储格式的条件下，Date 类型保存的日期能够精确到 1970 年 1 月 1 日之前或之后的 285 616 年。

### RegExp

**介绍**
ECMAScript 通过 RegExp 类型来支持正则表达式。使用下面类似 Perl 的语法，就可以创建一个正则表达式。

```js
var expression = / pattern / flags ;
```

其中的模式（pattern）部分可以是任何简单或复杂的正则表达式，可以包含字符类、限定符、分组、
向前查找以及反向引用。每个正则表达式都可带有一或多个标志（flags），用以标明正则表达式的行为。
正则表达式的匹配模式支持下列 3 个标志。
`g`：表示全局（global）模式，即模式将被应用于所有字符串，而非在发现第一个匹配项时立即
停止；
`i`：表示不区分大小写（case-insensitive）模式，即在确定匹配项时忽略模式与字符串的大小写；
`m`：表示多行（multiline）模式，即在到达一行文本末尾时还会继续查找下一行中是否存在与模
式匹配的项。

**测试工具**
<https://tool.lu/regex/>

### Object

**Object()**
`Object.prototype.valueOf.call()` 可以把一个原始值转换成对象，但是这个方法名太长了。
`Object()` 当Object被作为一个普通函数（而非构造函数）调用时，它的作用是 `类型转换 转换成对象` 。

在Object的所有子类型中，`valueOf()`方法是将包装对象转换为原始值（正好和上述描述相反），
例 String.prototype.valueOf.call("abc")

**对象添加getter与setter**
1.字面值创建对象时声明get和set

```js
 var o = {
    a : 7,
    get b(){return this.a +1;},
    set c(x){this.a = x/2}
  };
```

2.Object.create() 方法创建一个拥有指定原型和若干个指定属性的对象，指定属性中加get和set
3.[Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
4.Object.defineProperties
5.Object.prototype.__defineGetter__ 以及 Object.prototype.__defineSetter__ , 非标准方法。

**对象属性遍历**
1.`for (let i in obj)`
自身和原型
可以枚举属性
for循环出key
2.`Object.keys()`
自身
可枚举属性
返回key数组
3.`Object.values()`
返回value数组
4.`Object.entries()`
返回下标0是key、下标1是value的数组的数组
5.`Object.getOwnPropertyNames`
自身
所有属性
返回key数组
6.反射

**对象属性的顺序**
在ES5和早期标准中，没有指定属性的顺序
从ES6开始（Object.getOwnPropertyNames，Reflect.ownKeys），属性的顺序是基于一个特殊的规则的
数字：当属性的类型时数字类型时，
会按照数字的从大到小的顺序进行排序；
字符串：当属性的类型是字符串时，
会按照时间的先后顺序进行排序；
Symbol：当属性的类型是Symbol时，
会按照时间的先后顺序进行排序。

**深浅拷贝**
浅拷贝: 只对第一层键值对进行独立的复制
`for in ` / `Object.keys` / `展开运算符 ...` / `Object.assign`
[深拷贝](./jscode/deepclone.js)

## 类型判断

### ==和===区别

对于 == 来说，如果对比双方的类型不一样的话，就会进行类型转换

判断流程
首先会判断两者类型是否相同。相同的话就是比大小了
类型不相同的话，那么就会进行类型转换

1. 会先判断是否在对比 null 和 undefined，是的话就会返回 true
2. 判断两者类型是否为 string 和 number，是的话就会将字符串转换为 number。1 == '1' -> 1 ==  1
3. 判断其中一方是否为 boolean，是的话就会把 boolean 转为 number 再进行判断。'1' == true -> '1' ==  1 ->  1  ==  1
4. 判断其中一方是否为 object 且另一方为 string、number 或者 symbol，是的话就会把 object 转为原始类型再进行判断。'1' == { name: 'yck' } -> '1' == '[object Object]'

对于 === 来说就简单多了，就是判断两者类型和值是否相同

NaN和任何比都是false

### typeof instanceof Object.prototype.toString.call()

typeof 对于原始类型来说，除了 null 都可以显示正确的类型
typeof 对于对象来说，除了函数都会显示 object

instanceof内部机制是通过原型链来判断的
instanceof不能判断原始类型

Object.prototype.toString.call()
Array 、Function等类型作为Object的实例，都重写了toString方法,不能直接用

## 类型转换

在 JS 中类型转换只有三种情况

- 转换为布尔值
- 转换为数字
- 转换为字符串

**转Boolean**
在条件判断时，除了 undefined，null， false， NaN， ''， 0， -0，其他所有值都转为 true，包括所有对象

**四则运算符**
运算中，+号，数字隐式转换成字符串。其余的运算符号是字符串隐式转换成数字。

```js
4 * '3' // 12
4 * [] // 0
4 * [1, 2] // NaN
```

以下分析+号

运算中其中一方为字符串，那么就会把另一方也转换为字符串
如果有一个操作数是对象、数值或布尔值，则调用它们的 toString()方法取得相应的字符串值，
然后再应用前面关于字符串的规则。对于 undefined 和 null，则分别调用 String()函数并取得字符串"undefined"和"null"

```js
[] + {} // "[object Object]"
{} + {} // "[object Object][object Object]"
```

当[]遇上加号时有点古怪（加号会把空字符串转为0）

```js
{} + [] // 0
[] + [] // ""
String([]) // ""
+String([]) // 0
```

另外对于加法还需要注意这个表达式
'a' + + 'b' // -> "aNaN"

**比较运算符**
如果是对象，对象可以用toPrimitive转换成原始类型 [Symbol.toPrimitive](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive)
如果是字符串，就通过 unicode 字符索引来比较
