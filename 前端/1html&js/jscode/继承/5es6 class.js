  class Rectangle {
    // constructor
    constructor (height, width) {
        this.height = height
        this.width = width
    }

    // Getter
    get area () {
        return this.calcArea()
    }

    // Method
    calcArea () {
        return this.height * this.width
    }
}

const rectangle = new Rectangle(10, 20)
console.log(rectangle.area)
// 输出 200
// 继承
class Square extends Rectangle {

    constructor (length) {
        super(length, length)

        // 如果子类中存在构造函数，则需要在使用“this”之前首先调用 super()。
        this.name = 'Square'
    }

    get area () {
        return this.height * this.width
    }
}

const square = new Square(10)
console.log(square.area)
// 输出 100
