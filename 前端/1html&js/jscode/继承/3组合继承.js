function SuperType(name) {
    this.name = name
    this.colors = ['red', 'blue', 'green']
}
SuperType.prototype.sayName = function () {
    console.log(this.name)
}

function SubType(name, age) {
    // 继承属性
    SuperType.call(this, name);
    this.age = age
}
// 继承方法
SubType.prototype = new SuperType(); 
SubType.prototype.sayAge = function() { 
 console.log(this.age); 
}; 

let instance1 = new SubType("Nicholas", 29); 
instance1.colors.push("black"); 
console.log(instance1.colors); // "red,blue,green,black" 
instance1.sayName(); // "Nicholas"; 
instance1.sayAge(); // 29 
let instance2 = new SubType("Greg", 27); 
console.log(instance2.colors); // "red,blue,green" 
instance2.sayName(); // "Greg"; 
instance2.sayAge(); // 27

// 组合上述两种方法就是组合继承。用原型链实现对原型属性和方法的继承，用借用构造函数技术来实现实例属性的继承。
// 缺点：调用了两次父类构造函数
// 第一次调用SuperType()：给SubType.prototype写入两个属性name，color。
// 第二次调用SuperType()：给instance1写入两个属性name，color。