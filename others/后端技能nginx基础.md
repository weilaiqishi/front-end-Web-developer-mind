# 后端技能nginx基础

## Markdown 实用技巧－基础语法

<https://juejin.cn/post/6844903448442470414>

## 常规文件地址

<https://www.jianshu.com/p/cfed9b17a18b>

配置文件
/etc/nginx/nginx.conf
/usr/local/nginx/conf/nginx.conf
程序文件
/usr/sbin/nginx
日志
/var/log/nginx
/usr/local/nginx/logs
默认虚拟主机
/var/www/html

## 命令

$sudo /etc/init.d/nginx start
/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
启动
$sudo /etc/init.d/nginx stop
停止
$sudo /etc/init.d/nginx restart
重启
$sudo /etc/init.d/nginx status
状态
lsof -i:80
查看端口占用
/usr/sbin/nginx -t -c /etc/nginx/nginx.conf
测试nginx.conf文件
用新配置重启nginx -s reload

## nignx配置

nginx.conf中默认有 include /etc/nginx/conf.d/*.conf;
我们添加域名解析就在conf.d目录下创建
域名.conf文件来配置 例 www.abc.com.conf
有一天不用了就改一下后缀
