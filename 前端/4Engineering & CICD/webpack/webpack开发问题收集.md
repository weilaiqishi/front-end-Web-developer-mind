# webpack开发问题收集

## 配置

### 优化(Optimization)

**webpack 打包后生成很多小文件怎么优化？**
问题
<https://segmentfault.com/q/1010000039159663/>
几KB的小文件太多了,会影响浏览器加载资源
 Chrome has a limit of 6 connections per host name, and a max of 10 connections. This essentially means that it can handle 6 requests at a time coming from the same host, and will handle 4 more coming from another host at the same time.

答案
LimitChunkCountPlugin
<https://webpack.docschina.org/plugins/limit-chunk-count-plugin#root>
```js
new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 5,
    minChunkSize: 1000
})
```
链式写法
```js
const webpack = require('webpack')
module.exports = {
  chainWebpack: config => {
        config.plugin('chunkPlugin').use(webpack.optimize.LimitChunkCountPlugin,[{
                maxChunks:5, // 必须大于或等于 1
                minChunkSize: 10000
            }])
    }
}
```

**mini-css-extract-plugin插件快速入门**
<https://juejin.cn/post/6844903826630115335>