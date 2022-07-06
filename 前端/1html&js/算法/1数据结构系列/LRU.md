# leetcode JS实现LRU

参考文章
[算法就像搭乐高：带你手撸 LRU 算法](https://labuladong.gitee.io/algo/2/22/58/)
[面试官：请使用JS完成一个LRU缓存？](https://mp.weixin.qq.com/s/pmViMv4dyM73mYeo_fQ70g)

## 什么是 LRU

`LRU` 是一个非常经典的算法，原理不难，一般在大学的操作系统课程里有学过，是在内存不够的场景下淘汰旧内容的策略。

在一般标准的操作系统教材里，会用下面的方式来演示 `LRU` 原理，假设内存只能容纳3个页大小，按照 7 0 1 2 0 3 0 4 的次序访问页。假设内存按照栈的方式来描述访问时间，在上面的，是最近访问的，在下面的是，最远时间访问的。
![LRU](https://img-blog.csdnimg.cn/20191109174241708.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JlbG9uZ3RvY29kZQ==,size_16,color_FFFFFF,t_70)

## 使用场景

1. 操作系统底层的内存管理，其中就包括有 LRU 算法
2. 常见的缓存服务，比如 redis 等等
3. 浏览器的最近浏览记录存储、智能手机后台应用展示
![智能手机后台应用展示](https://labuladong.gitee.io/algo/images/LRU%e7%ae%97%e6%b3%95/1.jpg)

## LRU 算法需求

力扣第 146 题 [LRU缓存机制](https://leetcode.cn/problems/lru-cache/)

首先要接收一个 `capacity` 参数作为缓存的最大容量，然后实现两个 `API`，一个是 `put(key, val)` 方法存入键值对，另一个是 `get(key)` 方法获取 `key` 对应的 `val`，如果 `key` 不存在则返回 -1。

`get` 和 `put` 方法必须都是 `O(1)` 的时间复杂度

## 算法设计

1. 显然 `cache` 中的元素必须有时序，以区分最近使用的和久未使用的数据，当容量满了之后要删除最久未使用的那个元素腾位置。
2. 我们要在 `cache` 中快速找某个 `key` 是否已存在并得到对应的 `val`
3. 每次访问 `cache` 中的某个 `key`，需要将这个元素变为最近使用的，也就是说 `cache` 要支持在任意位置快速插入和删除元素。

`哈希表` 查找快，但是数据无固定顺序；`链表`有顺序之分，插入删除快，但是查找慢。所以结合一下，形成一种新的数据结构：`哈希链表LinkedHashMap`
![哈希链表LinkedHashMap](https://labuladong.gitee.io/algo/images/LRU%e7%ae%97%e6%b3%95/4.jpg)

在 JavaScript 里面这个数据结构就是 `Map`，使用起来还是比较方便的

具体实现

`put`:  `map` 里面添加新数据，如果添加的数据存在了，则先删除该条数据，然后再添加。如果添加数据后超长了，则需要删除最久远的一条数据。`data.keys().next().value` 便是获取最后一条数据的意思。

`get`: 首先从 `map` 对象中拿出该条数据，然后删除该条数据，最后再重新插入该条数据，确保将该条数据移动到最前面。

代码如下

```ts
class LRUCache {
  capacity: number
  map: Map<string | number, any>
  constructor(capacity: number) {
    this.capacity = capacity
    this.map = new Map()
  }

  get(key: string | number): any {
    if(!this.map.has(key)) {
      return -1
    }
    const val = this.map.get(key)
    this.map.delete(key)
    this.map.set(key, val)
    return val
  }

  put(key: string | number, value: any): void {
    if(this.map.has(key)) {
      this.map.delete(key)
    }
    this.map.set(key, value)

    if(this.map.size > this.capacity) {
      const delKey = this.map.keys().next().value
      this.map.delete(delKey)
    }
  }
}

const lruCache = new LRUCache(3)
const arr = [7, 0, 1, 2, 0, 3, 0, 4]

for (let i of arr) {
  lruCache.put(i, i)
  console.log(lruCache)
}
```
