// JavaScript常用八种继承方案
// https://juejin.cn/post/6844903696111763470
// 1. 原型链继承
function SuperType() {
  this.property = true;
}

SuperType.prototype.getSuperValue = function() {
  return this.property
}

function SubType() {
  this.subproperty = false;
}

// 继承SuperType
SubType.prototype = new SuperType();

SubType.prototype.getSubValue = function () {
  return this.subproperty;
}

let instance = new SubType();
console.log(instance.getSuperValue()); // true

// 原型链方案存在的缺点：多个实例对引用类型的操作会被篡改。
// 问题二：子类型实例化时不能给父类型的构造函数传参