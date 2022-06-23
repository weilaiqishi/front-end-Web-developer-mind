# semver

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

`semver`，`Semantic Versioning` 语义化版本的缩写，文档可见 <https://semver.org/> ，它由 `[major, minor, patch]` 三部分组成，其中

- `major`: 当你发了一个含有 Breaking Change 的 API
- `minor`: 当你新增了一个向后兼容的功能时
- `patch`: 当你修复了一个向后兼容的 Bug 时

假设你的版本库中含有一个函数

```js
// 假设原函数
export const sum = (x: number, y: number): number => x + y;

// Patch Version，修复小 Bug
export const sum = (x: number, y: number): number => x + y;

// Minor Version，向后兼容
export const sum = (...rest: number[]): number =>
  rest.reduce((s, x) => s + x, 0);

// Marjor Version，出现 Breaking Change
export const sub = () => {};
```

对于 `~1.2.3` 而言，它的版本号范围是 `>=1.2.3 <1.3.0`

对于 `^1.2.3` 而言，它的版本号范围是 `>=1.2.3 <2.0.0`

当我们 `npm i` 时，默认的版本号是 `^`，可最大限度地在向后兼容与新特性之间做取舍，但是有些库有可能不遵循该规则，我们在项目时应当使用 `yarn.lock/package-lock.json` 锁定版本号。

我们看看 `package-lock` 的工作流程。

1. `npm i webpack`，此时下载最新 webpack 版本 `5.58.2`，在 `package.json` 中显示为 `webpack: ^5.58.2`，版本号范围是 `>=5.58.2 < 6.0.0`
2. 在 `package-lock.json` 中全局搜索 `webpack`，发现 `webpack` 的版本是被锁定的，也是说它是确定的 `webpack: 5.58.2`
3. 经过一个月后，webpack 最新版本为 `5.100.0`，但由于 `webpack` 版本在 `package-lock.json` 中锁死，每次上线时仍然下载 `5.58.2` 版本号
4. 经过一年后，webpack 最新版本为 `6.0.0`，但由于 `webpack` 版本在 `package-lock.json` 中锁死，且 package.json 中 `webpack` 版本号为 `^5.58.2`，与 `package-lock.json` 中为一致的版本范围。每次上线时仍然下载 `5.58.2` 版本号
5. 支线剧情：经过一年后，webpack 最新版本为 `6.0.0`，需要进行升级，此时手动改写 `package.json` 中 `webpack` 版本号为 `^6.0.0`，与 `package-lock.json` 中不是一致的版本范围。此时 `npm i` 将下载 `6.0.0` 最新版本号，并重写 `package-lock.json` 中锁定的版本号为 `6.0.0`

## 一个问题总结:

`npm i` 某个 `package` 时会修改 `package-lock.json` 中的版本号吗？

当 `package-lock.json` 该 package 锁死的版本号符合 `package.json` 中的版本号范围时，将以 `package-lock.json` 锁死版本号为主。

当 `package-lock.json` 该 package 锁死的版本号不符合 `package.json` 中的版本号范围时，将会安装该 package 符合 `package.json` 版本号范围的最新版本号，并重写 `package-lock.json`
