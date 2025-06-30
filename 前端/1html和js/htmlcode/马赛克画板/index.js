// 使用html + js写一个马赛克画板：
// 1. 页面加载时，要求用户输入两个整数，对应长和宽，例如100, 200
// 2. 页面显示100*200个格子，要求占满整个窗口，不能有滚动条。
// 3. 当窗口大小变化时，依然要满足上述条件
// 4. 鼠标左键点击任意一个格子时，填入一个随机颜色，即#000000-#FFFFFF中的一种
// 5. 鼠标右键点击此格子时，擦除颜色
// 6. 每次进行上述的第4点或者第5点的操作时，显示“颜色岛“的数量（一个颜色岛的定义就是相邻的已着色区域块）。要求这个数字以美观的形式展示，1秒后自动消失，具体样式和动画可以自行设计。
// 7. 敲击键盘c键时，对每一个已着色的格子随机产生另一个颜色，并且设计一个渐变动画，每个格子要从原来的颜色渐变成新颜色



// 用户输入长宽生成画板
function setting () {
    // 获取值并检测
    const height = Number(document.getElementById('settingHeight').value)
    const width = Number(document.getElementById('settingWidth').value)
    try {
        if (!/^[1-9]+[0-9]*]*$/.test(height)) { throw '长不是正整数' }
        if (!/^[1-9]+[0-9]*]*$/.test(width)) { throw '宽不是正整数' }
    } catch (err) {
        console.log(err)
        alert(err)
        return
    }

    // 隐藏表单生成马赛克画板
    const settingForm = document.getElementById('setting')
    settingForm.classList.add('noshow')

    // 设置画板css
    const container = document.getElementById('container')
    container.style.gridTemplateColumns = new Array(width).fill(null).reduce((acc, cur) => { return acc += '1fr ' }, '')
    container.style.gridTemplateRows = new Array(height).fill(null).reduce((acc, cur) => { return acc += '1fr ' }, '')
    // 填充格子
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const box = document.createElement('div')
            box.classList.add('box')
            box.setAttribute('x_y', `${i}_${j}`)
            container.appendChild(box)
        }
    }
}



// 鼠标操作
window.onmousedown = (event) => {
    const xy = event.target.getAttribute('x_y')
    if (!xy) { return }
    const div = event.target

    // c键反转需要渐变 鼠标操作不需要
    div.classList.add('notransition')
    setTimeout(() => {
        div.classList.remove('notransition')
    })

    // 左键填色
    if (event.button === 0) {
        changBgColor(div, getRandomColor())
        colorIsland.addPoint(xy, div)
        
    }
    // 右键消色
    if (event.button === 2) {
        changBgColor(div, '#fff')
        colorIsland.deletePoint(xy)
    }
    showMessage(colorIsland.countBlocks())

}
document.oncontextmenu = function (e) { e.preventDefault() }
function getRandomColor () {
    return '#' + Math.random().toString(16).slice(2, 8)
}
function changBgColor (dom, color) {
    dom.style.backgroundColor = color
}
// 显示数字
function createMessage () {
    let zIndex = 1000
    let lastMessage = null
    let timeout = null
    function showMessage (Message) {
        function setStyle (element, style) {
            Object.keys(style).forEach(key => {
                element.style[key] = style[key]
            })
        }
        clear()
        const messageBox = lastMessage = document.createElement('div')
        messageBox.innerHTML = Message
        const css = {
            position: 'fixed',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: zIndex++,
            padding: '20px 40px',
            textAlign: 'center',
            color: '#fff',
            background: '#000',
            borderRadius: '10px',
            transition: 'all 1s ease-in',
            fontSize: '50px',
            pointerEvents: 'none'
        }
        setStyle(messageBox, css)
        document.body.appendChild(messageBox)
        setTimeout(() => {
            const css = { top: '-10%' }
            setStyle(messageBox, css)
        })
        timeout = setTimeout(() => {
            clear()
        }, 1000)
    }
    function clear () {
        lastMessage && document.body.removeChild(lastMessage)
        lastMessage = null
        timeout && clearTimeout(timeout)
        timeout = null
    }
    return showMessage
}
const showMessage = createMessage()



// 颜色岛 区块
class ColorIsland {
    constructor () {
        this.num = 0
        this.blocks = {}
    }
    addPoint (x_y_add, div) {
        const myBlockNames = []
        // 遍历颜色岛
        for (let blockName of Object.keys(this.blocks)) {
            // 如果新加的点已经存在，直接返回数量
            if (this.blocks[blockName][x_y_add]) { return }

            // 不存在就计算是否与现有的岛相连
            for (let x_y in this.blocks[blockName]) {
                if (this.checkBlock(x_y_add, x_y)) {
                    this.blocks[blockName][x_y_add] = div
                    myBlockNames.push(blockName)
                    break
                }
            }
        }

        if (!myBlockNames.length) {
            // 如果不属于现有岛，就自立一个岛
            this.addBlock({ [x_y_add]: div })
        } else if (myBlockNames.length > 1) {
            // 属于多个岛，合并
            this.mergeBlock(myBlockNames)
        }
    }
    deletePoint (x_y_delete) {
        // 遍历颜色岛找到所在岛屿
        for (let blockName of Object.keys(this.blocks)) {
            if (this.blocks[blockName][x_y_delete]) {
                this.splitBlock(blockName, x_y_delete)
                return
            }
        }
    }


    /**
     * 判断两个点是否相连，是否属于一个岛
     * @param {*} x_y_1 
     * @param {*} x_y_2
     * @returns {boolean} isblock
     */
    checkBlock (x_y_1, x_y_2) {
        const [x1, y1] = x_y_1.split('_')
        const [x2, y2] = x_y_2.split('_')
        return (Math.abs(x2 - x1)) <= 1 && (Math.abs(y2 - y1)) <= 1
    }
    /**
     * 添加一个岛
     * @param {*} block
     * @returns {number} blockName
     */
    addBlock (block) {
        const blockName = this.num
        this.blocks[this.num++] = block
        return blockName
    }
    /**
     * 合并多个岛为一个大岛
     * @param {*} blockNames 
     * @returns {number} blockName
     */
    mergeBlock (blockNames) {
        const bigBlock = blockNames.reduce((res, name) => {
            Object.assign(res, this.blocks[name])
            delete this.blocks[name]
            return res
        }, {})
        return this.addBlock(bigBlock)
    }
    /**
     * 数颜色岛数量
     * @returns {number} blocksNumber
     */
    countBlocks () {
        return Object.keys(this.blocks).length
    }
    /**
     * 分裂一个岛
     * @param {*} blockName
     * @param {*} x_y_delete
     * @returns {void}
     */
    splitBlock (blockName, x_y_delete) {
        delete this.blocks[blockName][x_y_delete]
        const points = Object.assign({}, this.blocks[blockName])
        delete this.blocks[blockName]
        Object.keys(points).forEach(x_y => this.addPoint(x_y, points[x_y]))
        return
    }
}
const colorIsland = new ColorIsland()



// 键盘操作
function throttle(fn, delay, ) {
    let lock = false
    return function (...args) {
        if (!lock) {
            fn(...args)
            lock = true
            setTimeout(() => {
                lock = false
            }, delay)
        }
    }
}
document.onkeydown = throttle((event) => {
    if (event.keyCode === 67) {
        Object.values(colorIsland.blocks).forEach(block => {
            Object.values(block).forEach(div => {
                changBgColor(div, getRandomColor())
            })
        })
    }
}, 1000)



// document.getElementById('settingHeight').value = 3
// document.getElementById('settingWidth').value = 4
// setting()