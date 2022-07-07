// 实现一个EatMan
// 说明：实现一个EatMan，EatMan可以有以下一些行为
// 示例：
//    1. EatMan('Hank')输出:
//     Hi! This is Hank!
//    2. EatMan('Hank').eat('dinner').eat('supper')输出
//     Hi! This is Hank!
//     Eat dinner~
//     Eat supper~
//    3. EatMan('Hank').eat('dinner').eatFirst('lunch')输出
//     Eat lunch~
//     Hi! This is Hank!
//     Eat dinner~
//    4. EatMan('Hank').eat('dinner').eatFirst('lunch').eatFirst('breakfast')输出
//     Eat breakfast~
//     Eat lunch~
//     Hi! This is Hank!
//     Eat dinner~

class EatMan {
    name: string
    task: Function[]
    constructor(name: string) {
        this.name = name
        this.task = []
        this.task.push(() => this.printName())
        this.run()
    }
    printName() {
        console.log(`Hi! This is ${this.name}!`)
    }
    eat(food: string) {
        this.task.push(() => {
            console.log(`Eat ${food}~`)
        })
        this.run()
        return this
    }
    eatFirst(food: string) {
        this.task.unshift(() => {
            console.log(`Eat ${food}~`)
        })
        this.run()
        return this
    }
    run() {
        setTimeout(() => {
            const task = this.task.shift()
            if (task) {
                task()
            }
        }, 0)
    }
}

const eatMan = new EatMan('Hank').eat('dinner').eatFirst('lunch').eatFirst('breakfast')

setTimeout(() => {
    eatMan.eat('dinner2').eatFirst('lunch2').eatFirst('breakfast2')
}, 100)