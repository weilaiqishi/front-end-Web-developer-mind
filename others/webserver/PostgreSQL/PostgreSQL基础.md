# PostgreSQL基础

安装教程
<https://www.postgresql.org/download/linux/ubuntu/>

在ubuntu用apt安装后默认目录在/etc/postgresql

配置教程
<https://linux.cn/article-11480-1.html>

user postgres
password my_password

检查 PostgreSQL 是否正在运行

```shell
service postgresql status
```

重启

```shell
service postgresql restart
```

PostgreSQL 允许远程访问设置方法
<https://blog.csdn.net/ll136078/article/details/12747403>

/etc/postgresql/14/main/pg_hba.conf
