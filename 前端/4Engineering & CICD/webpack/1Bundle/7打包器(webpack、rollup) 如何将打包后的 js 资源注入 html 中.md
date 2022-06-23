# 打包器(webpack、rollup) 如何将打包后的 js 资源注入 html 中

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

打包好js后需要往html放脚本地址，在 webpack 的世界里，它是 `html-webpak-plugin`，在 rollup 的世界里，它是 `@rollup/plugin-html`。

**注入的原理为当打包器已生成 entryPoint 文件资源后，获得其文件名及 `publicPath`，并将其注入到 html 中**

以 `html-webpack-plugin` 为例，它在 `compilation` 处理资源的 `processAssets` 获得其打包生成的资源。伪代码如下

```js
class HtmlWebpackPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    const webpack = compiler.webpack;

    compiler.hooks.thisCompilation.tap("HtmlWebpackPlugin", (compilation) => {
      // compilation 是 webpack 中最重要的对象，文档见 [compilation-object](https://webpack.js.org/api/compilation-object/#compilation-object-methods)

      compilation.hooks.processAssets.tapAsync(
        {
          name: "HtmlWebpackPlugin",

          // processAssets 处理资源的时机，此阶段为资源已优化后，更多阶段见文档
          // https://webpack.js.org/api/compilation-hooks/#list-of-asset-processing-stages
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        (compilationAssets, callback) => {
          // compilationAssets 将得到所有生成的资源，如各个 chunk.js、各个 image、css

          // 获取 webpac.output.publicPath 选项，(PS: publicPath 选项有可能是通过函数设置)
          const publicPath = getPublicPath(compilation);

          // 本示例仅仅考虑单个 entryPoint 的情况
          // compilation.entrypoints 可获取入口文件信息
          const entryNames = Array.from(compilation.entrypoints.keys());

          // entryPoint.getFiles() 将获取到该入口的所有资源，并能够保证加载顺序！！！如 runtime-chunk -> main-chunk
          const assets = entryNames
            .map((entryName) =>
              compilation.entrypoints.get(entryName).getFiles()
            )
            .flat();
          const scripts = assets.map((src) => publicPath + src);
          const content = html({
            title: this.options.title || "Demo",
            scripts,
          });

          // emitAsset 用以生成资源文件，也是最重要的一步
          compilation.emitAsset(
            "index.html",
            new webpack.sources.RawSource(content)
          );
          callback();
        }
      );
    });
  }
}
```
