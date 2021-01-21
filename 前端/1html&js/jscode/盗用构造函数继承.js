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