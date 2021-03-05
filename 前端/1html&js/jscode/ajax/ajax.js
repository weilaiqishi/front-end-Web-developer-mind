function ajax (options) {
    return new Promise((resolve, reject) => {
        let method = options.method || 'GET',
            params = options.params, // GET请求携带的参数
            data = options.data, // POST请求传递的参数
            url = options.url + (params ? '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&') : ''),
            async = options.async === false ? false : true,
            success = options.success,
            headers = options.headers
        let xhr
        //  IE5、6不兼容XMLHttpRequest，所以要使用ActiveXObject()对象，并传入 'Microsoft.XMLHTTP'，达到兼容目的。
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest()
        } else {
            xhr = new ActiveXObject('Microsoft.XMLHTTP')
        }
        xhr.onreadystatechange = function () {
            /*
            readyState的五种状态详解：
                0 － （未初始化）还没有调用send()方法
                1 － （载入）已调用send()方法，正在发送请求
                2 － （载入完成）send()方法执行完成，已经接收到全部响应内容
                3 － （交互）正在解析响应内容
                4 － （完成）响应内容解析完成，可以在客户端调用了
             */

            if (xhr.readyState === 4 && xhr.status >= 200) {
                console.log(xhr)
                clearTimeout(timeout)
                success && success(xhr.response)
                resolve(xhr.response)

            }
        }
        xhr.open(method, url, async)
        if (headers) {
            Object.keys(Headers).forEach(key => xhr.setRequestHeader(key, headers[key]))
        }
        method === 'Get' ? xhr.send() : xhr.send(data)
        const timeout = setTimeout(() => {
            reject(new Error('time out'))
        }, 5000)
    })
}
// https://blog.csdn.net/weixin_40054326/article/details/106391342