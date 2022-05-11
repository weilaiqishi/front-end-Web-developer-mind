# [Node strapi] Node.js使用 nodemailer 发送电子邮件

`nodemailer` 是一个简单实现邮件发送的 Node.js 开源库。
本文将记录如何在 `Strapi`(v4版本) 中使用 nodemailer
如果您使用 `express` 框架，可以参考[这篇文章](https://lzxjack.top/post?title=email)

## @strapi/provider-email-nodemailer

`Strapi` 会经常使用插件来扩展功能
我们在google上搜 strapi + nodemailer, 很容易找到这款插件 [@strapi/provider-email-nodemailer](https://www.npmjs.com/package/@strapi/provider-email-nodemailer)

### 安装

在 Strapi 项目下执行

```shell
yarn add @strapi/provider-email-nodemailer
```

### 插件配置

在 `config/plugins.js` 文件中加入email的配置，这里使用 163 做服务商

```js
module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.163.com'
        port: 465, 
        auth: {
          user: 'kimeng1998@163.com', // 自己的邮箱地址
          pass: '', // 授权码
        },
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: '"Kimeng"<kimeng1998@163.com>', // 发件人
      },
    },
  },
  // ...
});
```

### 使用

```js
await strapi
  .plugin('email')
  .service('email')
  .send({
    to: 'someone@example.com',
    from: 'someone2@example.com',
    subject: 'Hello world',
    text: 'Hello world',
    html: `<h4>Hello world</h4>`,
  });
```
