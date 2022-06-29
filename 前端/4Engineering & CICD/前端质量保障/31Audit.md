# 如何检测出你们安装的依赖是否安全

转载自[山月前端工程化三十八讲](https://q.shanyue.tech/engineering/)

如何确保所有 npm install 的依赖都是安全的？

`Audit`，审计，检测你的所有依赖是否安全。`npm audit`/`yarn audit` 均有效。

通过审计，可看出有风险的 `package`、依赖库的依赖链、风险原因及其解决方案。

通过 `npm audit fix` 可以自动修复该库的风险，原理就是升级依赖库，升级至已修复了风险的版本号。

![synk](https://snyk.io/)是一个高级版的 npm audit，可自动修复，且支持 CICD 集成与多种语言。

```bash
npx snyk wizard
```

