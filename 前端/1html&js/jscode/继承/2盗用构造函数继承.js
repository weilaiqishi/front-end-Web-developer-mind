// 2. 盗用构造函数继承
function SuperType() {
    this.colors = ['red', 'blue', 'green']
}

function SubType() {
    // 继承SuperType
    SuperType.call(this)
}

let instance1 = new SubType()
instance1.colors.push('black')
console.log(instane1.colors) // red, blue, green, black

let instance2 = new SubType()
console.log(instance2.colors) // red, blue, green

// 使用父类的构造函数来增强子类实例，等同于复制父类的实例给子类（不使用原型）
// 创建子类实例时用this去call父类构造函数，于是SubType的每个实例都会将SuperType中的属性复制一份。

// 缺点：
// 只能继承父类的实例属性和方法，不能继承原型属性/方法
// 无法实现复用，每个子类都有父类实例函数的副本，影响性能