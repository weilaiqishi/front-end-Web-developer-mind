# ts

[中文文档](https://chorer.github.io/Vuepress-TypeScriptDoc/Handbook/TheTypeScriptHandbook.html#%E5%85%B3%E4%BA%8E%E6%9C%AC%E6%89%8B%E5%86%8C)
[英文文档](https://www.typescriptlang.org/docs/handbook/intro.html)

## ts数据类型

- 原始类型：string、number 和 boolean
- 数组
- any
- 对象类型
- 联合类型
- 接口(接口声明是另一种命名对象类型的方式)
- 字面量类型(将具体的字符串或者数字看作一种类型)
- null和undefined
- 枚举
- 其它不常见的原始类型：BigInt、symbol
- void、never、tuple

## ts介绍

优点

- 代码的可读性和可维护性：举个🌰看后端某个接口返回值，一般需要去network看or去看接口文档，才知道返回数据结构，而正确用了ts后，编辑器会提醒接口返回值的类型，这点相当实用。
- 在编译阶段就发现大部分错误，避免了很多线上bug
- 增强了编辑器和 IDE 的功能，包括代码补全、接口提示、跳转到定义等

缺点

- 有一定的学习成本，需要理解接口（Interfaces）、泛型（Generics）、类（Classes）、枚举类型（Enums）等前端工程师可能不是很熟悉的概念
- 前期会增加一些开发成本
- ts编译是需要时间的，这就意味着项目大了以后，开发环境启动和生产环境打包的速度就成了考验

## type 与 interface

类型别名 `type` 可以用来给一个类型起个新名字，当命名基本类型或联合类型等非对象类型时非常有用

```ts
type MyNumber = number;
type StringOrNumber = string | number;
```

而接口 `interface` 只能用于定义对象类型，Vue 3 中的 App 对象就是使用 interface 来定义的

相同点

1. 类型别名和接口都可以用来描述对象或函数。
2. 类型别名和接口都支持扩展。类型别名通过 `&（交叉运算符）` 来扩展，而接口通过 `extends` 的方式来扩展（可以 extends interface和type）。

不同点

1. 类型别名可以为基本类型、联合类型或元组类型定义别名，而接口不行
2. 同名接口会自动合并，而类型别名不会（同名类型别名会冲突）。依赖库内部使用interface定义类型，让使用者可自由地扩展接口。

```ts
import { ProtocolWithReturn, onMessage  } from 'webext-bridge'
​
declare module 'webext-bridge' {
  export interface ProtocolMap {
    foo: { title: string }
    bar: ProtocolWithReturn<CustomDataType, CustomReturnType>
  }
}

onMessage('foo', ({ data }) => {
  // type of `data` will be `{ title: string }`
  console.log(data.title)
}
```

使用类型别名的场景：

- 定义基本类型的别名时，使用 type
- 定义元组类型时，使用 type
- 定义函数类型时，使用 type
- 定义联合类型时，使用 type
- 定义映射类型时，使用 type

使用接口的场景：

- 需要利用接口自动合并特性的时候，使用 interface
- 定义对象类型且无需使用 type 的时候，使用 interface

## 工具类型

```ts
// lib.es5.d.ts
type Partial<T> = {
    [P in keyof T]?: T[P];
};
​
type Required<T> = {
    [P in keyof T]-?: T[P];
};
​
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
​
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
​
type Exclude<T, U> = T extends U ? never : T;

type Omit<T, K extends number | string | symbol> = {
    [Key in Exclude<keyof T, K>]: T[Key]
};

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

理解为：如果 T 继承了 (...args: any[]) => any 类型，则返回类型 R，否则返回 any。其中 R 是什么呢？R 被定义在 extends (...args: any[]) => infer R 中，即 R 是从传入参数类型中推导出来的。

## 类

ts类里的关键字

- `public`
- `private` 类的外部不可用，继承也不行
- `protected` 类的外部不可用，继承可以
- `public readOnly` xxx 只读属性
- `static` funcXXX 静态方法，不需要 new 就可以调用
- `abstract` funcXXX 抽象类，所有子类都必须要实现 funcXXX

[类中的成员修饰符](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/53988daf69b144e9b5e0a3bc413cd96c~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)

### 类的继承和抽象类

TS中的继承ES6中的类的继承极其相识，子类可以通过extends关键字继承一个类
但是它还有抽象类的概念，而且抽象类作为基类，不能new

[类的继承和抽象类](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e6fe2eb768c14bdbb3736cc6cee7199d~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp?)