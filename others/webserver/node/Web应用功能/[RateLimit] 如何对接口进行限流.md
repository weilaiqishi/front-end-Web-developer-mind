# [RateLimit] 如何对接口进行限流

## Leaky Bucket (漏桶算法)

漏桶算法表示水滴（请求）先进入到漏桶里，漏桶（bucket）以一定的速度出水，当漏桶中水满时，无法再加水。

- 维护一个计数器作为 bucket，计数器的上限为 bucket 的大小
- 计数器满时拒绝请求
- 每隔一段时间清空计数器

[漏桶算法](https://d33wubrfki0l68.cloudfront.net/e737eb0be9176ca74d03344f082281154f90f12c/c0076/assets/img/leaky-bucket.f8cb8f08.png)

以下是使用 redis 的计数器实现限流的伪代码

```js
const option = {
  max: 10,        // window 时间内限速10个请求
  window: 1000    // 1s
}

function access(req) {
  // 根据请求生成唯一标志
  const key = identity(req)
  // 计数器自增
  const counter = redis.incr(key)
  if (counter === 1) {
    // 如果是当前时间窗口的第一个请求，设置过期时间
    redis.expire(key, window) 
  }
  if (counter > option.window) {
    return false
  }
  return true
}
```

[Redis 官方使用 INCR 实现限流的文档](https://redis.io/commands/INCR)

它的时间窗口并不是滑动窗口那样在桶里出去一个球，就可以再进来一个球。而更像是一个固定时间窗口，从桶里出去一群球，再开始进球。正因为如此，它可能在固定窗口的后一半时间收到 `max-1` 次请求，又在下一个固定窗口内打来 `max` 次请求，此时在一个随机的窗口时间内最多会有 `2 * max - 1` 次请求。

另外还有一个redis的 `INCR` 与 `EXPIRE` 的原子性问题，容易造成 `Race Condition`，可以通过 SETNX 来解决

```js
redis.set(key, 0, 'EX', option.window, 'NX')
```

## Token Bucket (令牌桶算法)

[令牌桶算法](https://shanyue.tech/assets/img/token-bucket.ccc8a747.png)

1. 令牌桶初始状态 bucket 是满的，漏桶初始状态 bucket 是空的
2. 令牌桶在 bucket 空的时候拒绝新的请求，漏桶在 bucket 满的时候拒绝新的请求
3. 当一个请求来临时，假设一个请求消耗一个token，令牌桶的 bucket 减少一个 token，漏桶增加一个 token

## strapi 简单实现单机限流

使用 `koa2-ratelimit` middlewares
利用 请求路径和ip做唯一标志

有 `MemoryStore` / `MongodbStore` / `RedisStore` / `SequelizeStore`
都要实现核心接口 `incr` (增量寄存器) / `decrement` (减少) / `saveAbuse` (保存滥用者)

MemoryStore代码

```js
const Store = require('./Store.js');

let Hits = {};

class MemoryStore extends Store {
    static cleanAll() {
        Hits = {};
    }

    _getHit(key, options) {
        if (!Hits[key]) {
            Hits[key] = {
                counter: 0,
                date_end: Date.now() + options.interval,
            };
        }
        return Hits[key];
    }

    _resetAll() {
        const now = Date.now();
        for (const key in Hits) { // eslint-disable-line
            this._resetKey(key, now);
        }
    }

    _resetKey(key, now) {
        now = now || Date.now();
        if (Hits[key] && Hits[key].date_end <= now) {
            delete Hits[key];
        }
    }

    async incr(key, options, weight) {
        this._resetAll();
        const hits = this._getHit(key, options);
        hits.counter += weight;

        return {
            counter: hits.counter,
            dateEnd: hits.date_end,
        };
    }

    decrement(key, options, weight) {
        const hits = this._getHit(key);
        hits.counter -= weight;
    }

    saveAbuse() {}
}

module.exports = MemoryStore;
```

RateLimit.js代码

```js
const Store = require('./Store.js');
const MemoryStore = require('./MemoryStore.js');

/* eslint-disable no-var */
var defaultOptions = {
    // window, delay, and max apply per-key unless global is set to true
    interval: { min: 1 }, // milliseconds - how long to keep records of requests in memory
    delayAfter: 0, // how many requests to allow through before starting to delay responses
    timeWait: { sec: 1 }, // milliseconds - base delay applied to the response - multiplied by number of recent hits for the same key.
    max: 5, // max number of recent connections during `window` milliseconds before sending a 429 response

    message: 'Too many requests, please try again later.',
    statusCode: 429, // 429 status = Too Many Requests (RFC 6585)
    headers: true, // Send custom rate limit header with limit and remaining
    skipFailedRequests: false, // Do not count failed requests (status >= 400)
    prefixKey: 'global', // the prefixKey to get to remove all key

    store: new MemoryStore(),

    // redefin fonction
    keyGenerator: undefined,
    skip: undefined,
    getUserId: undefined,
    handler: undefined,
    onLimitReached: undefined,
    weight: undefined,

    whitelist: []
};

const TimeKeys = ['ms', 'sec', 'min', 'hour', 'day', 'week', 'month', 'year'];
const Times = {
    ms: 1,
    sec: 1000,
    min: 60000,
    hour: 3600000,
    day: 86400000,
    week: 604800000,
    month: 2628000000,
    year: 12 * 2628000000,
};
const toFinds = ['id', 'userId', 'user_id', 'idUser', 'id_user'];

class RateLimit {
    constructor(options) {
        this.options = Object.assign({}, defaultOptions, options);
        this.options.interval = RateLimit.timeToMs(this.options.interval);
        this.options.timeWait = RateLimit.timeToMs(this.options.timeWait);

        // store to use for persisting rate limit data
        this.store = this.options.store;

        // ensure that the store extends Store class
        if (!(this.store instanceof Store)) {
            throw new Error('The store is not valid.');
        }
    }

    static timeToMs(time) {
        if (typeof time === 'object') {
            let timeMs = 0;
            for (const key in time) {
                if (key) {
                    if (!TimeKeys.includes(key)) {
                        throw new Error(`Invalide key ${key}, allow keys: ${TimeKeys.toString()}`);
                    }
                    if (time[key] > 0) {
                        timeMs += time[key] * Times[key];
                    }
                }
            }
            return timeMs;
        }
        return time;
    }

    async keyGenerator(ctx) {
        if (this.options.keyGenerator) {
            return this.options.keyGenerator(ctx);
        }
        const userId = await this.getUserId(ctx);
        if (userId) {
            return `${this.options.prefixKey}|${userId}`;
        }
        return `${this.options.prefixKey}|${ctx.request.ip}`;
    }

    async weight(ctx) {
        if (this.options.weight) {
            return this.options.weight(ctx);
        }
        return 1;
    }

    async skip(ctx) { // eslint-disable-line
        if (this.options.skip) {
            return this.options.skip(ctx);
        }
        return false;
    }

    async getUserId(ctx) {
        if (this.options.getUserId) {
            return this.options.getUserId(ctx);
        }
        const whereFinds = [ctx.state.user, ctx.user, ctx.state.User, ctx.User, ctx.state, ctx];
        for (const whereFind of whereFinds) {
            if (whereFind) {
                for (const toFind of toFinds) {
                    if (whereFind[toFind]) {
                        return whereFind[toFind];
                    }
                }
            }
        }
        return null;
    }

    async handler(ctx/* , next */) {
        if (this.options.handler) {
            this.options.handler(ctx);
        } else {
            ctx.status = this.options.statusCode;
            ctx.body = { message: this.options.message };
            if (this.options.headers) {
                ctx.set('Retry-After', Math.ceil(this.options.interval / 1000));
            }
        }
    }

    async onLimitReached(ctx) {
        if (this.options.onLimitReached) {
            this.options.onLimitReached(ctx);
        } else {
            this.store.saveAbuse(Object.assign({}, this.options, {
                key: await this.keyGenerator(ctx),
                ip: ctx.request.ip,
                user_id: await this.getUserId(ctx),
            }));
        }
    }

    get middleware() {
        return this._rateLimit.bind(this);
    }

    async _rateLimit(ctx, next) {
        const skip = await this.skip(ctx);
        if (skip) {
            return next();
        }

        const key = await this.keyGenerator(ctx);
        if (this._isWhitelisted(key)) {
            return next();
        }
        const weight = await this.weight(ctx);

        const { counter, dateEnd } = await this.store.incr(key, this.options, weight);
        const reset = new Date(dateEnd).getTime();
        ctx.state.rateLimit = {
            limit: this.options.max,
            current: counter,
            remaining: Math.max(this.options.max - counter, 0),
            reset: Math.ceil(reset / 1000),
        };

        if (this.options.headers) {
            ctx.set('X-RateLimit-Limit', this.options.max);
            ctx.set('X-RateLimit-Remaining', ctx.state.rateLimit.remaining);
            ctx.set('X-RateLimit-Reset', ctx.state.rateLimit.reset);
        }

        if (this.options.max && counter > this.options.max) {
            await this.onLimitReached(ctx);
            return this.handler(ctx, next);
        }

        if (this.options.skipFailedRequests) {
            ctx.res.on('finish', () => {
                if (ctx.status >= 400) {
                    this.store.decrement(key, this.options, weight);
                }
            });
        }

        if (this.options.delayAfter && this.options.timeWait && counter > this.options.delayAfter) {
            const delay = (counter - this.options.delayAfter) * this.options.timeWait;
            await this.wait(delay);
            return next();
        }
        return next();
    }

    _isWhitelisted(key) {
        const arr = key.split('::');
        if (arr.length > 0) {
            const ip = arr[1];
            const { whitelist } = this.options;
            return whitelist.includes(ip);
        }
        return false;
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = {
    RateLimit,
    middleware(options = {}) {
        return new RateLimit(options).middleware;
    },
    defaultOptions(options = {}) {
        defaultOptions = Object.assign(defaultOptions, options);
    },
};
```