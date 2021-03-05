class newRouter {
    constructor () {
        this.routes = {}
        this.currentUrl = ''
    }

    // 切割 hash，渲染页面
    refresh () {
        this.currentUrl = location.hash.slice(1) || '/'          		 //location.hash获得#/setting  /this.currentUrl获得/setting
        this.routes[this.currentUrl] && this.routes[this.currentUrl]()    //回调函数
    }

    // 初始化
    init () { //加载或者路径发生变化时 刷新构造函数 中的变量
        window.addEventListener('load', this.refresh.bind(this), false)        //加一个监听函数，绑定this    this指向这个类
        window.addEventListener('hashchange', this.refresh.bind(this), false)
    }

    // 传入 URL 以及 根据 URL 对应的回调函数
    route (path, callback = () => { }) {
        this.routes[path] = callback
    }
}
// https://blog.csdn.net/weixin_40679578/article/details/90646046