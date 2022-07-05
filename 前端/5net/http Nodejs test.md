# http Nodejs test

使用 Node.js 简单实现 http

## 网络基础与TCP/IP

![OSI TCP/IP](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/920a5c55b6394135bfda32b33e052e86~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

## TCP与HTTP是什么

### 什么是TCP通讯？

传输层有两种通讯方式分别是TCP和UDP。

对于一门高级编程语言来讲无论是（C++ ， Java， JS）一般都是可以基于叫做socket的东西完成数据传输的。

### TCP通讯程序

用 `Node` 尝试一下 TCP

Client

```ts
const net =  require('net')

const client = net.connect(3000, () => {
  console.log("连接到服务器！")
})

let n = 3;
const interval = setInterval(() => {
  const msg = "Time " + new Date().getTime();
  console.log("客户端发送: " + msg);
  client.write(msg);
  if (n-- === 0) {
    client.end();
    clearInterval(interval);
  }
}, 500);

client.on("end", function () {
  console.log("断开与服务器的连接");
});
```

Server

```ts
const net = require('net')

const server = net.createServer((connection) => {
  console.log("client connected");
  connection.on("data", (data) => {
    console.log("Server接收: " + data.toString())
  })
  connection.on("end", function () {
    console.log("客户端关闭连接")
  })
  connection.end("Hello I am \r\n")
});
server.listen(3000, function () {
  console.log("server is listening at 3000")
})
```

用 `ts-node` 先启动服务端 再启动客户端

服务端表现和客户端表现
![server](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b1bb5918a24849a1a36cba8d16689c24~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

### 为什么需要HTTP协议

超文本传输协议（英文：HyperText Transfer Protocol，缩写：HTTP）是一种用于分布式、协作式和超媒体信息系统的应用层协议。HTTP是万维网的数据通信的基础。

已图书馆为比喻，TCP只是提供了交换数据的可能，相当于打开了借书小窗口。真正要完成借书还书还需要设计一个借书单。其实这个借书单就是HTTP协议。
![http协议内容比喻](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/23bde7492c1d42a68a0a01f070cf595a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

### HTTP协议规则

其实HTTP报文就是一个文本，这里面使用分隔符比如空格、回车、换行符来区分他的不同部分。
![HTTP报文](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a0ce8ddbddb48e7be02ff0d48dcc8bd~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)
![http响应报文协议格式](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f704557049c54189aed53a9072a8b75f~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

#### 解析HTTP报文与构造报文

**第一步 拆分请求行、头部、请求体**

- 请求行： 就是第一行 - 第一个回车符和换行符前的字符都是请求行
- 头部： 请求行之后一直到遇到一个空行 -- 其实就是遇到两个连续的回车符和换行符
- 请求体： 剩下的部分

**第二步 解析请求行**
请求结构就是 ： 请求方法 + 【空格】+ URL +【空格】+ 版本号

**第三步 解析头部**
头部的结构：
KEY_A : VALUE
KEY_A : VALUE
KEY_C : VALUE

**请求体**
请求体就是剩下的部分无需解析

**构造报文**
反着来生成文本就可以，请求和响应的头部分别处理就行

```ts
export class http {
  httpMessage: {
    method?
    url?
    version?
    headers?: Record<string, string>
  }
  parse(message): void {
    this.httpMessage = {}
    const messages = message.split('\r\n');
    const [head] = messages;
    const headers = messages.slice(1, -2);
    const [body] = messages.slice(-1);
    this.parseHead(head);
    this.parseHeaders(headers);
    this.parseBody(body);
  }
  private parseHead(headStr) {
    const [method, url, version] = headStr.split(' ');
    this.httpMessage.method = method;
    this.httpMessage.url = url;
    this.httpMessage.version = version;
  }
  private parseHeaders(headers) {
    this.httpMessage.headers = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      let [key, value] = header.split(":");
      key = key.toLocaleLowerCase();
      value = value.trim();
      this.httpMessage.headers[key] = value;
    }
  }
  private parseBody(str: string) {
    return str
  }
  static format(req: {
    method
    url
    version
    headers
    body
  }) {
    const head = `${req.method} ${req.url} ${req.version}`;
    let headers = '';
    for (let key in req.headers) {
    const value = req.headers[key];
    headers += `${key.toLocaleLowerCase()}: ${value}\r\n`;
    }
    const combineData = [head, headers, req.body].join('\r\n');
    return combineData;
  }
  static formatRes(res: {
    version
    status
    message
    headers
    body
  }) {
    const head = `${res.version} ${res.status} ${res.message}`;
    let headers = '';
    for (let key in res.headers) {
    const value = res.headers[key];
    headers += `${key.toLocaleLowerCase()}: ${value}\r\n`;
    }
    const combineData = [head, headers, res.body].join('\r\n');
    return combineData;
  }
}
```

## 实现HTTP爬虫访问百度首页

```ts
import { http } from './http'

const net = require("net")

const req = {
  method: "GET",
  url: "/",
  version: "HTTP/1.1",
  headers: { "user-agent": "curl/7.71.1", accept: "*/*" },
  body: ""
}

console.log(http.format(req))

const client = net.connect(80, "www.baidu.com", () => {
  console.log("连接到服务器！")
  client.write(http.format(req))
})
client.on("data", function (data) {
  console.log(data.toString())
  client.end()
});
client.on("end", function () {
  console.log("断开与服务器的连接")
})
```

然叔的示例
![httpToBaidu](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fda4ba58e1f74d13a0868ba427f96865~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

## 实现能被Chrome访问的HTTP服务器

```ts
import { http } from './http'

const net = require("net")

const res = {
  version: "HTTP/1.1",
  status: "200",
  message: "OK",
  headers: {
    date: "Sat, 04 Dec 2021 14",
    connection: "keep-alive",
    "keep-alive": "timeout=5",
    // "content-length": "19",
  },
  body: "<h1> Hello HTTP<h1>"
}

const server = net.createServer(function (connection) {
  console.log("client connected")
  connection.on("data", (data) => {
    const str = data.toString()
    const ahttp = new http()
    ahttp.parse(str)
    console.log(ahttp)
  })
  connection.on("end", function () {
    console.log("客户端关闭连接")
  })
  connection.end(http.formatRes(res))
})
server.listen(3000, function () {
  console.log("server is listening")
})
```

然叔的示例
![httpFromChrome](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ad3033dd4ab749b1a0657c29f909f665~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)
