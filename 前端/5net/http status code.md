# http status code

## 20x

### 200 OK

表示请求成功

如果是 `GET` 请求，代表**资源获取成功**。

```sh
$ curl --head https://www.baidu.com
HTTP/1.1 200 OK
Accept-Ranges: bytes
Cache-Control: private, no-cache, no-store, proxy-revalidate, no-transform
Connection: keep-alive
Content-Length: 277
Content-Type: text/html
Date: Tue, 16 Aug 2022 03:30:21 GMT
Etag: "575e1f72-115"
Last-Modified: Mon, 13 Jun 2016 02:50:26 GMT
Pragma: no-cache
Server: bfe/1.0.8.18
```

### 201 Created

一般用以 `POST` 请求，代表服务器**资源创建成功**。

如在 Github 中，创建 Issue 成功，则返回一个 201 的状态码。

### 204 No Content

No Content，即服务器不会发送响应体（Response Body）。

1. PUT 请求，修改资源的某个状态，此时 204 代表修改成功，无需响应体。见 RFC7231之 204 状态码(opens new window)
2. DELETE/OPTION 请求
3. 打点 API

示例一: 掘金为 Options 请求的状态码设置为 204

![204](https://shanyue.tech/assets/img/204.5355a3b7.png)

示例二: 知乎为 Delete 请求的状态码设置为 204，以下请求代表取消关注某人。

![204](https://shanyue.tech/assets/img/204-del.ee530dd7.png)

### 206 Partial Content

当客户端指定 `Range` 范围请求头时，服务器端将会返回部分资源，即 `Partial Content`，此时状态码为 206。

当请求音视频资源体积过大时，一般使用 206 较多。

与之相关的有以下 Header

- range/content-range: 客户端发送 `range` 请求头指定范围，若满足范围，服务器返回响应头 `content-range` 以及状态码 206。若不满足，则返回 `416 Range Not Satisfiable` 状态码。

## 301/302/307/308 与重定向

- 301，`Moved Permanently`。永久重定向，该操作比较危险，需要谨慎操作：**如果设置了 301，但是一段时间后又想取消，但是浏览器中已经有了缓存，还是会重定向**。
- 302，`Found`。临时重定向，但是会在重定向的时候改变 method：把 POST 改成 GET，于是有了 307。302例子是 移动端访问 www.bilibili.com 临时重定向到 m.bilibili.co
- 307，`Temporary Redirect`。临时重定向，在重定向时不会改变 method。
- 308，`Permanent Redirect`。永久重定向，在重定向时不会改变 method。

### Location Header

在 HTTP 重定向时，会使用 `Location` 响应头来指明重定向后的地址。HTTP 的 Header 不区分大小写，因此以下的 `location` 与 `Location` 相同。

```sh
# Github 301 示例
$ curl --head https://www.github.com
HTTP/2 301
content-length: 0
location: https://github.com/

# zhihu 301 示例
$ curl --head https://zhihu.com
HTTP/1.1 301 Moved Permanently
Server: CLOUD ELB 1.0.0
Date: Sun, 14 Aug 2022 17:00:07 GMT
Content-Type: text/html
Content-Length: 182
Connection: keep-alive
Location: https://www.zhihu.com/
X-Backend-Response: 0.000
Vary: Accept-Encoding
Referrer-Policy: no-referrer-when-downgrade
X-SecNG-Response: 0
x-lb-timing: 0.001
x-idc-id: 2
Set-Cookie: KLBRSID=e42bab774ac0012482937540873c03cf|1660496407|1660496407; Path=/

# zhihu 302 示例，登录首页将会 302 重定向到 //www.zhihu.com/signin?next=%2F 登录页面
$ curl --head https://www.zhihu.com
HTTP/2 302
server: CLOUD ELB 1.0.0
date: Sun, 14 Aug 2022 17:06:57 GMT
content-type: text/html; charset=utf-8
set-cookie: _zap=2937e593-b374-460e-8682-0a0f57ae3336; path=/; expires=Tue, 13 Aug 2024 17:06:57 GMT; domain=.zhihu.com
set-cookie: _xsrf=d2864bd9-a40d-44ee-9798-12ed9a89b981; path=/; domain=.zhihu.com
x-frame-options: SAMEORIGIN
strict-transport-security: max-age=15552000; includeSubDomains
surrogate-control: no-store
pragma: no-cache
expires: 0
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
location: //www.zhihu.com/signin?next=%2F
x-backend-response: 0.001
vary: Accept-Encoding
referrer-policy: no-referrer-when-downgrade
x-secng-response: 0.005000114440918
x-lb-timing: 0.006
x-idc-id: 2
set-cookie: KLBRSID=b33d76655747159914ef8c32323d16fd|1660496817|1660496817; Path=/
cache-control: private, must-revalidate, no-cache, no-store, max-age=0
content-length: 93
x-nws-log-uuid: 3658595918315504587
x-cache-lookup: Cache Miss
x-edge-timing: 0.042
x-cdn-provider: tencent
```

### Response Body

301/302/307/308 响应有 Response Body 吗？

可以有，如上示例，知乎的重定向就包含响应体，b站的跳转h5没有响应体

### client and follow redirect

在客户端发送请求时，如果发现某网址经重定向，则可再次向重定向后的网址发送请求。一些 HTTP 客户端工具，则会自动集成该功能，比如 curl 通过 `--location` 即可。

```sh
$ curl --head --location https://zhihu.com
```

在 fetch API 中，也可以通过 `follow` 控制是否追踪重定向。

```js
fetch('https://zhihu.com', { follow: 'redirect' })
```
