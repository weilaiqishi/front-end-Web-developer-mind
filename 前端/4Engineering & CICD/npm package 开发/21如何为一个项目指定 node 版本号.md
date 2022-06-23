# 如何为一个项目指定 node 版本号

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

指定一个项目所需的 node 最小版本，这属于一个项目的质量工程。

如果对于版本不匹配将会报错(yarn)或警告(npm)，那我们需要在 `package.json` 中的 `engines` 字段中指定 Node 版本号

```js
{
  "engines": {
    "node": ">=14.0.0"
  }
}
```

一个示例：

我在本地把项目所需要的 node 版本号改成 >=16.0.0，而本地的 node 版本号为 v10.24.1

此时，npm 将会发生警告，提示你本地的 node 版本与此项目不符。

```sh
npm WARN EBADENGINE Unsupported engine { package: 'next-app@1.0.0',
npm WARN EBADENGINE   required: { node: '>=16.0.0' },
npm WARN EBADENGINE   current: { node: 'v10.24.1', npm: '7.14.0' } }
```

而 yarn 将会直接报错，提示

```sh
error next-app@1.0.0: The engine "node" is incompatible with this module. Expected version ">=16.0.0". Got "10.24.1"
```

此时无法正常运行项目，可避免意外发生。
