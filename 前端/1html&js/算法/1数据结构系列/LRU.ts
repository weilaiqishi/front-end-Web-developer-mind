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