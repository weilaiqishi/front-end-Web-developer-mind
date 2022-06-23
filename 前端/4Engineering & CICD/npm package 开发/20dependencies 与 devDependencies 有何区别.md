# dependencies 与 devDependencies 有何区别

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

**对于业务代码而讲，它俩区别不大**

当进行业务开发时，严格区分 `dependencies` 与 `devDependencies` 并无必要，实际上，大部分业务对二者也并无严格区别。

当打包时，依靠的是 `Webpack/Rollup` 对代码进行模块依赖分析，与该模块是否在 `dep/devDep` 并无关系，只要在 `node_modules` 上能够找到该 `Package` 即可。

以至于在 CI 中 `npm i --production` 可加快包安装速度也无必要，因为在 CI 中仍需要 lint、test、build 等。

**对于库 (Package) 开发而言，是有严格区分的**

- dependencies: 在生产环境中使用
- devDependencies: 在开发环境中使用，如 webpack/babel/eslint 等

当在项目中安装一个依赖的 Package 时，该依赖的 `dependencies` 也会安装到项目中，即被下载到 `node_modules` 目录中。但是 `devDependencies` 不会

一些 Package 宣称自己是 `zero dependencies`，一般就是指不依赖任何 `dependencies`，如 `highlight`