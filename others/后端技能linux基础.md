# 后端技能linux基础

## Markdown 实用技巧－基础语法

<https://juejin.cn/post/6844903448442470414>

## linux命令大全

<https://www.zhihu.com/question/452895041/answer/1951671508>

## ssh

### 公钥登录

**scp发送公钥到远程服务器**
windows的.ssh目录下

```bash
scp -p id_rsa.pub root@[IP地址]:/root/.ssh/authorized_keys
```

**登录**
ssh root@ip

**客户端配置config文件**
其模板如下

```yml
Host any name here
  HostName <your server address>
  Port <22>
  User <username>
  IdentitiesOnly yes
```

一个具体的例子

```yml
Host aliyun
  HostName 192.168.21.43
  Port 22
  User vkso
  IdentitiesOnly yes
```

**walle宿主机登录目标机**

1. 命令行（适合机器数量少的），当然也可以用expect脚本批量

```bash
[walle]$ ssh-copy-id -i ~/.ssh/id_rsa.pub work@172.1.2.3
```

2. 手工复制粘贴

```bash
[walle]$ cat ~/.ssh/id_rsa.pub #复制
[work@172.1.2.3]$  vi ~/.ssh/authorized_keys #粘到最后面
```

**服务器配置ssh**
1. 修改ssh目录权限

```bash
chmod 700 ~/.ssh          # chmod 755 .ssh 也是可以的
chmod 600 ~/.ssh/authorized_keys
```

2. 修改ssh配置

```bash
vim sshd_config
```

```yml
RSAAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile      .ssh/authorized_keys .ssh/authorized_keys2
```

3. 运行

```bash
service sshd restart
```

### 转发

<https://wangdoc.com/ssh/port-forwarding.html>

**本地转发**

```bash
ssh -L local-port:target-host:target-port tunnel-host
```

例 本地开发访问服务机上数据库

```bash
ssh -L 5433:111.11.111.111:5432 root@111.11.111.111 -N
```

## vim

i
进入编辑模式
esc键
退出编辑模式

:wq
保存退出
:wq!
强制保存退出
:q!
强制退出
:set nu
显示行号
:set nonu
不显示行号
:nohl
不高亮显示
:x
同样也是保存退出

## 其他命令

**传输文件**

```bash
scp /path/filename username@servername:/path_on_server/
scp username@servername:/path_on_server/ /path/filename
```

文件夹带上 -r

```bash
scp ./tpyStrapi.zip root@111.11.111.111:/var/www/
scp -r ./dist/h5 root@111.11.111.111:/var/www/tpyh5
```

**看日志**
常见命令
tail/head/cat/tac/sed/less/echo

查看目录下所有日志

```bash
zgrep 'abc' ./*
```

看一个日志

```bash
cat -n  /root/.pm2/logs/mq-lottery-strapi-out-441.log | grep ">>> lottery"
```

循环读取

```bash
tail -f
```

**进程查看**
`ps -ef` 和 `ps aux`

```bash
ps -aux | grep nginx
```

**性能查看**
`top`
在top里按m键可以看内存

**文件操作**
移动文件

```bash
mv 文件名 移动目的地文件名
```

重命名文件

```bash
mv 文件名 修改后的文件名
```

复制文件

```bash
cp SOURCE DEST
```

创建文件

```bash
vim
```

创建文件夹

```bash
mkdir [选项] DirName
```

解压

```bash
sudo apt install unzip
unzip zipped_file.zip -d unzipped_directory
```

**查找**
<https://blog.csdn.net/lufqnuli/article/details/50888382>