/*
* 贪婪模式与非贪婪模式 区别在于问号
* */

var re1 = /^(\d+)(0*)$/;
console.log(re1.exec('102300'));

var re2 = /^(\d+?)(0*)$/;
console.log(re2.exec('102300'));

/*
* 机制猜测，不断的让问号下一个判断条件尝试是否匹配，如果？号能匹配，下一个也能匹配，则让给下一个
* */