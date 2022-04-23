# [Node.js全文检索] 机翻 Full-text search with Node.js and ElasticSearch on Docker

原文作者使用 `Docker` 部署一个 使用了全文检索的 Node 应用，
如果想在 Windows 系统上尝试，可以使用 `wsl`，并安装 WSL 2 上的 Docker
[WSL 2 上的 Docker 远程容器入门](https://docs.microsoft.com/zh-cn/windows/wsl/tutorials/wsl-containers)

原文地址
<https://towardsdatascience.com/full-text-search-with-node-js-and-elasticsearch-on-docker-edcea23612fd>

## 让我们基于 Node.js、ElasticSearch 和 Docker 构建一个真实的应用程序

全文搜索既可怕又令人兴奋。一些流行的数据库，如 MySql 和 Postgres 是存储数据的绝佳解决方案……但在全文搜索性能方面，ElasticSearch 没有竞争对手。

对于那些不知道的人，`ElasticSearch` 是一个建立在 `Lucene` 之上的搜索引擎服务器，具有惊人的分布式架构支持。根据 [db-engines.com](db-engines.com)，它是目前最常用的搜索引擎。

在这篇文章中，我们将构建一个名为 The Quotes Database 的简单 REST 应用程序，它允许我们存储和搜索任意数量的报价！

我已经准备了一个 [JSON 文件](https://github.com/micheleriva/the-quotes-database/blob/master/src/data/quotes.json)，其中包含 5000 多个作者的引文；我们将使用它作为填充 ElasticSearch 的起始数据。

[GitHub地址](https://github.com/micheleriva/the-quotes-database/blob/master/src/data/quotes.json)

## 设置 Docker

首先，我们不想在机器上（手动）安装 ElasticSearch。我们将使用 Docker 在容器上编排 Node.js 服务器和 ES 实例，这将允许我们部署具有所有所需依赖项的生产就绪应用程序！

让我们在项目根文件夹中创建一个 `Dockerfile`:

```Dockerfile
FROM node:10.15.3-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g pm2

COPY . ./

EXPOSE 3000
EXPOSE 9200

CMD npm run start
```

如您所见，我们告诉 Docker 我们将运行 Node.js 10.15.3-alpine 版本。我们还将在 `/usr/src/app` 下创建一个新的工作目录，我们将在其中复制 `package.json` 和 `package-lock.json` 文件。这样，Docker 将能够在 `WORKDIR` 中运行 `npm install`，安装我们需要的依赖项。

我们还将通过运行 `RUN npm install -g pm2` 全局安装 [PM2](https://pm2.keymetrics.io/)。 Node.js 运行时是单线程的，因此如果一个进程崩溃，则需要重新启动整个应用程序...... PM2 检查 Node.js 进程状态并在应用程序因任何原因出现故障时重新启动它。

安装 PM2 后，我们将在 `WORKDIR` (`COPY ../`) 中复制代码库，并告诉 Docker 公开两个端口：`3000` 将公开 RESTful 服务，`9200` 将公开 ElasticSearch 服务（`EXPOSE 3000` 和 `EXPOSE 9200`）。

最后，我们告诉 Docker 启动 Node.js 应用程序：`npm run start` 。

## 设置 docker-compose

现在你可能想知道，“_太棒了，我明白了！但是如何处理 Docker 中的 ElasticSearch 实例呢？我在我的 Dockerfile 中找不到它！_”……你说得对！这是 docker-compose 用武之地。它允许我们编排多个 Docker 容器并在它们之间创建连接。因此，让我们写下 `docker-compose.yml` 文件，该文件将存储在项目根目录中：

```yml
version: '3.6'
services:
  api:
    image: node:10.15.3-alpine
    container_name: tqd-node
    build: .
    ports:
      - 3000:3000
    environment:
     - NODE_ENV=local
     - ES_HOST=elasticsearch
     - NODE_PORT=3000
     - ELASTIC_URL=http://elasticsearch:9200
    volumes:
      - .:/usr/src/app/quotes
    command: npm run start
    links:
        - elasticsearch
    depends_on:
        - elasticsearch
    networks: 
      - esnet
  elasticsearch:
    container_name: tqd-elasticsearch
    image: docker.elastic.co/elasticsearch/elasticsearch:7.0.1
    volumes:
      - esdata:/usr/share/elasticsearch/data
    environment:
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - discovery.type=single-node
    logging:
      driver: none
    ports:
      - 9300:9300
      - 9200:9200
    networks: 
      - esnet
volumes:
  esdata:
networks:
  esnet:
```

这比 Dockerfile 复杂一点，但让我们分析一下：

- 我们声明我们正在使用的文件是哪个版本的 docker-compose.yml (3.6)
- 我们声明服务：`api` 这是 Node.js 应用程序。就像在 Dockerfile 中一样，它需要 `node:10.15.3-alpine` 镜像。我们还为这个容器分配了一个名称：`tqd-node`，在这里，我们使用 `build .` 命令 调用之前创建的 Dockerfile。然后我们需要暴露 `3000` 端口，如您所见，我们编写如下语句：`3000:3000`。这意味着我们正在从端口 `3000`（在容器内）映射到端口 `3000`（可以从机器访问）。然后我们将设置一些环境变量。值 `elasticsearch` 是一个变量，它引用了 `docker-compose.yml` 文件中的 `elasticsearch` 服务。我们还想挂载一个卷：`/usr/src/app/quotes`。这样，一旦我们重新启动容器，我们将维护数据而不会丢失它。再一次，我们告诉 Docker 一旦容器启动我们需要执行哪个命令 (`command: npm run start`)，然后我们设置一个指向 `elasticsearch` 服务的链接。我们还告诉 Docker 在 `elasticsearch` 服务启动后启动 `api` 服务（使用 `depends_on` 指令）。最后，我们告诉 Docker 连接 `esnet` 网络下的 `api` 服务。那是因为每个容器都有自己的网络：这样，我们称之为 `api` 和 `elasticsearch` `服务共享同一个网络，所以它们将能够使用相同的端口相互调用。elasticsearch` 这是（你可能已经猜到了） ES 服务。它的配置与 `api` 服务非常相似。我们将切断其详细日志，将 `logging` 指令设置为 `driver: none` 。
- 我们声明存储 ES 数据的卷
- 我们声明网络 `esnet`

## 开发 Node.js 应用程序

现在我们需要创建 Node.js 应用程序，所以让我们开始设置 `package.json` 文件：

```shell
npm init -y
```

现在我们需要安装一些依赖项：

```shell
npm i -s @elastic/elasticsearch body-parser cors dotenv express
```

好，我们的 `package.json` 文件应该如下所示：

```json
{
  "name": "nodejselastic",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@elastic/elasticsearch": "^7.3.0",
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "dotenv": "^8.0.0",
    "express": "^4.17.1"
  }
}
```

让我们在 Node.js 中实现 ElasticSearch 连接器。首先，我们需要创建一个新的 `/src/elastic.js` 文件：

```js
const { Client } = require("@elastic/elasticsearch");
                   require("dotenv").config();

const elasticUrl = process.env.ELASTIC_URL || "http://localhost:9200";
const esclient   = new Client({ node: elasticUrl });
const index      = "quotes";
const type       = "quotes";
```

如您所见，我们在这里设置了一些非常有用的常量。首先，我们使用 `@elastic/elasticsearch` 官方 Node.js SDK 创建一个到 ElasticSearch 的新连接；然后，我们定义一个索引（"quotes"）和一个索引类型（"quotes"，稍后我们会看到它们的含义）。

现在我们需要在 ElasticSearch 上创建一个索引。您可以将“索引”视为等效的 SQL“数据库”。 ElasticSearch 是一个 NoSQL 数据库，这意味着它没有表——它只存储 JSON 文档。索引是一个逻辑命名空间，它映射到一个或多个主分片，并且可以有零个或多个副本分片。您可以在此处阅读有关 [ElasticSearch 索引](https://www.elastic.co/blog/what-is-an-elasticsearch-index) 的更多信息。

现在让我们定义一个创建索引的函数：

```js
async function createIndex(index) { 
  try {
    await esclient.indices.create({ index });
    console.log(`Created index ${index}`);
  } catch (err) {
    console.error(`An error occurred while creating the index ${index}:`);
    console.error(err);
  }
}
```

现在我们需要另一个函数来为 我们的 引文(quotes) 创建映射。映射定义了我们文档的架构和类型：

```js
async function setQuotesMapping () {
  try {
    const schema = {
      quote: {
        type: "text" 
      },
      author: {
        type: "text"
      }
    };

    await esclient.indices.putMapping({ 
      index, 
      type,
      include_type_name: true,
      body: { 
        properties: schema 
      } 
    })

    console.log("Quotes mapping created successfully");
  } catch (err) {
    console.error("An error occurred while setting the quotes mapping:");
    console.error(err);
  }
}
```

如您所见，我们正在为文档定义schema，并将其插入到索引中。

现在让我们考虑一下， ElasticSearch 是一个巨大的系统，可能需要几秒钟才能启动。在 ES 准备好之前，我们无法连接到 ES，因此我们需要一个函数来检查 ES 服务器何时准备好：

```js
function checkConnection() {
  return new Promise(async (resolve) => {

    console.log("Checking connection to ElasticSearch...");

    let isConnected = false;

    while (!isConnected) {

      try {
        await esclient.cluster.health({});
        console.log("Successfully connected to ElasticSearch");
        isConnected = true;
      // eslint-disable-next-line no-empty
      } catch (_) {}
    }

    resolve(true);

  });
}
```

如您所见，我们返回一个 Promise。通过使用 `async/await`，我们能够停止整个 Node.js 进程，直到这个 Promise 解决，在它连接到 ES 之前不启动 app 服务。这样，我们强制我们的 Node.js 在启动之前等待 ES。

我们完成了 ElasticSearch！现在，让我们导出我们的函数：

```js
module.exports = {
  esclient,
  setQuotesMapping,
  checkConnection,
  createIndex,
  index,
  type
};
```

好，让我们看看整个 `elastic.js` 文件：

```js
const { Client } = require("@elastic/elasticsearch");
                   require("dotenv").config();
const elasticUrl = process.env.ELASTIC_URL || "http://localhost:9200";
const esclient   = new Client({ node: elasticUrl });
const index      = "quotes";
const type       = "quotes";
/**
 * @function createIndex
 * @returns {void}
 * @description Creates an index in ElasticSearch.
 */
async function createIndex(index) {
  try {
    await esclient.indices.create({ index });
    console.log(`Created index ${index}`);
  } catch (err) {
    console.error(`An error occurred while creating the index ${index}:`);
    console.error(err);
  }
}
/**
 * @function setQuotesMapping,
 * @returns {void}
 * @description Sets the quotes mapping to the database.
 */
async function setQuotesMapping () {
  try {
    const schema = {
      quote: {
        type: "text" 
      },
      author: {
        type: "text"
      }
    };

    await esclient.indices.putMapping({ 
      index, 
      type,
      include_type_name: true,
      body: { 
        properties: schema 
      } 
    })

    console.log("Quotes mapping created successfully");

  } catch (err) {
    console.error("An error occurred while setting the quotes mapping:");
    console.error(err);
  }
}
/**
 * @function checkConnection
 * @returns {Promise}
 * @description Checks if the client is connected to ElasticSearch
 */
function checkConnection() {
  return new Promise(async (resolve) => {
    console.log("Checking connection to ElasticSearch...");
    let isConnected = false;
    while (!isConnected) {
      try {
        await esclient.cluster.health({});
        console.log("Successfully connected to ElasticSearch");
        isConnected = true;
      // eslint-disable-next-line no-empty
      } catch (_) {
      }
    }
    resolve(true);
  });
}
module.exports = {
  esclient,
  setQuotesMapping,
  checkConnection,
  createIndex,
  index,
  type
};
```

## 用引文填充ElasticSearch

现在我们需要用引文填充 ES 实例。这听起来很简单，但相信我，这可能是我们应用程序的一个棘手部分！

让我们在 /src/data/index.js 中创建一个新文件：

```js
const elastic = require("../elastic");
const quotes  = require("./quotes.json");

const esAction = {
  index: {
    _index: elastic.index,
    _type: elastic.type
  }
};
```

如您所见，我们正在导入我们刚刚创建的 `elastic` 模块以及来自存储在 `/src/data/quotes.json` 中的 JSON 文件的引号。我们还创建了一个名为 `esAction` 的对象，它会告诉 ES 在我们插入文档后如何索引它。

现在我们需要一个脚本来填充我们的数据库。我们还需要创建一个具有以下结构的 Object 数组：

```js
[
  {
    index: {
      _index: elastic.index,
      _type:  elastic.type
    }
  },
  {
    author: "quote author",
    quote:  "quote"
  },
  // ...
]
```

如您所见，对于我们要插入的每个引文，我们需要将其映射设置为 ElasticSeaech。这就是我们要做的：

```js
async function populateDatabase() {
  const docs = [];
  for (const quote of quotes) {
    docs.push(esAction);
    docs.push(quote);
  }
  return elastic.esclient.bulk({ body: docs });
}
```

好，现在让我们创建主文件 /src/main.js 并看看我们将如何构建我们迄今为止编写的所有内容：

```js
const elastic = require("./elastic");
const data    = require("./data");
                require("dotenv").config();

(async function main() {

  const isElasticReady = await elastic.checkConnection();
  if (isElasticReady) {
    const elasticIndex = await elastic.esclient.indices.exists({index: elastic.index});

    if (!elasticIndex.body) {
      await elastic.createIndex(elastic.index);
      await elastic.setQuotesMapping();
      await data.populateDatabase()
    }
  }

})();
```

让我们分析一下上面的代码。我们创建一个自动执行的 main 函数来检查 ES 连接。在连接 ES 之前，代码执行不会继续。当 ES 准备好时，我们将检查引文索引是否存在：如果不存在，我们将创建它，我们将设置它的映射，并填充数据库。显然，我们只会在第一次启动服务器时这样做！

## 创建 RESTful API

现在我们需要创建我们的 RESTful 服务器。我们将使用 Express.js，这是目前用于构建服务器的最流行的 Node.js 框架。

我们将从 `/src/server/index.js` 文件开始：

```js
const express      = require("express");
const cors         = require("cors");
const bodyParser   = require("body-parser");
const routes       = require("./routes");
                     require("dotenv").config();

const app  = express();
const port = process.env.NODE_PORT || 3000;

function start() {
  return  app.use(cors())
             .use(bodyParser.urlencoded({ extended: false }))
             .use(bodyParser.json())
             .use("/quotes",routes)
             .use((_req, res) => res.status(404).json({ success: false,error: "Route not found" }))
             .listen(port, () => console.log(`Server ready on port ${port}`));
}

module.exports = {
  start
};
```

如您所见，它只是一个标准的 Express.js 服务器；我们不会在这上面花太多时间。让我们看看我们的 `/src/server/routes/index.js` 文件：

```js
const express    = require("express");
const controller = require("../controllers");
const routes     = express.Router();

routes.route("/").get(controller.getQuotes);
routes.route("/new").post(controller.addQuote);

module.exports = routes;
```

我们创建两个接口：

- `GET /` 将返回与我们的查询字符串参数匹配的引文列表。
- `POST /new/` 将允许我们发布一个新的引文，将其存储在 ElasticSearch 中。

所以现在让我们看看 `/src/server/controllers/index.js` 文件：

```js
const model = require("../models");

async function getQuotes(req, res) {
  const query  = req.query;
  if (!query.text) {
    res.status(422).json({
      error: true,
      data: "Missing required parameter: text"
    });
    return;
  }
  try {
    const result = await model.getQuotes(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: "Unknown error."});
  }
}

async function addQuote(req, res) {
  const body = req.body;
  if (!body.quote || !body.author) {
    res.status(422).json({
      error: true,
      data: "Missing required parameter(s): 'body' or 'author'"
    });
    return;
  }
  try {
    const result = await model.insertNewQuote(body.quote, body.author);
    res.json({ 
      success: true, 
      data: {
        id:     result.body._id,
        author: body.author,
        quote:  body.quote
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Unknown error."});
  }
}
module.exports = {
  getQuotes,
  addQuote
};
```

在这里，我们基本上定义了两个函数：

- `getQuotes`，至少需要一个查询字符串参数：`text`
- `addQuote`，需要两个参数：`author` 和 `quote`

ElasticSearch 接口被委托给我们的 `/src/server/models/index.js`。这种结构有助于我们维护 MVC 式架构。让我们看看 model：

```js
const { esclient, index, type } = require("../../elastic");

async function getQuotes(req) {
  const query = {
    query: {
      match: {
        quote: {
          query: req.text,
          operator: "and",
          fuzziness: "auto"
        }
      }
    }
  }

  const { body: { hits } } = await esclient.search({
    from:  req.page  || 0,
    size:  req.limit || 100,
    index: index, 
    type:  type,
    body:  query
  });

  const results = hits.total.value;
  const values  = hits.hits.map((hit) => {
    return {
      id:     hit._id,
      quote:  hit._source.quote,
      author: hit._source.author,
      score:  hit._score
    }
  });

  return {
    results,
    values
  }
}
```

如您所见，我们通过 查询文本 和 索引类型 来组成 ElasticSearch 查询。然后，我们生成查询，设置 `page` 和 `limit` ：我们可以将它们传递到查询字符串中，例如：`http://localhost:3000/quotes?text=love&page=1&limit=100`。如果这些值没有通过查询字符串传递，我们就用默认值。

ElasticSearch 返回海量数据，但我们只需要四个东西：

- 引文 ID
- 引文文本本身
- 引文作者
- 分数

分数代表 引文文本 与 搜索词的接近程度；一旦我们有了这些值，我们就将它们与总结果数一起返回，这在前端对结果进行分页时可能很有用。

现在我们需要为 model 创建最后一个函数 insertNewQuote：

```js
async function insertNewQuote(quote, author) {
  return esclient.index({
    index,
    type,
    body: {
      quote,
      author
    }
  })
}
```

这个函数很简单：我们将 引文 和 作者 发布到索引中。现在完整的 /src/server/models/index.js 文件应该如下所示：

```js
const { esclient, index, type } = require("../../elastic");

async function getQuotes(req) {
  const query = {
    query: {
      match: {
        quote: {
          query: req.text,
          operator: "and",
          fuzziness: "auto"
        }
      }
    }
  }

  const { body: { hits } } = await esclient.search({
    from:  req.page  || 0,
    size:  req.limit || 100,
    index: index, 
    type:  type,
    body:  query
  });

  const results = hits.total.value;

  const values  = hits.hits.map((hit) => {
    return {
      id:     hit._id,
      quote:  hit._source.quote,
      author: hit._source.author,
      score:  hit._score
    }
  });

  return {
    results,
    values
  }
}

async function insertNewQuote(quote, author) {
  return esclient.index({
    index,
    type,
    body: {
      quote,
      author
    }
  })
}

module.exports = {
  getQuotes,
  insertNewQuote
}
```

我们完成了！我们需要在 `package.json` 文件中设置启动脚本，我们准备好了：

```json
"scripts": {
  "start": "pm2-runtime start ./src/main.js --name node_app",
  "stop": "pm2-runtime stop node_app "
}
```

我们还需要更新我们的 `/src/main.js` 脚本，以便在 ElasticSearch 连接后启动我们的 Express.js 服务器：

```js
const elastic = require("./elastic");
const server  = require("./server");
const data    = require("./data");
                require("dotenv").config();

(async function main() {
  const isElasticReady = await elastic.checkConnection();

  if (isElasticReady) {
    const elasticIndex = await elastic.esclient.indices.exists({index: elastic.index});

    if (!elasticIndex.body) {
      await elastic.createIndex(elastic.index);
      await elastic.setQuotesMapping();
      await data.populateDatabase()
    }

    server.start();
  }
})();
```

## 启动应用程序

我们现在已经准备好使用 docker-compose 启动我们的应用程序了！只需运行以下命令：

```shell
docker-compose up
```

(使用 docker-compose up -d 可以在后台运行，docker-compose down 关闭)

你需要等到 Docker 下载了 ElasticSearch 和 Node.js 镜像，然后它会启动你的服务器，你就可以准备使用 REST 接口！

让我们用几个 cURL 调用来测试：

```shell
curl localhost:3000/quotes?text=love&limit=3

{
  "success": true,
  "data": {
    "results": 716,
    "values": [
      {
        "id": "JDE3kGwBuLHMiUvv1itT",
        "quote": "There is only one happiness in life, to love and be loved.",
        "author": "George Sand",
        "score": 6.7102118
      },
      {
        "id": "JjE3kGwBuLHMiUvv1itT",
        "quote": "Live through feeling and you will live through love. For feeling is the language of the soul, and feeling is truth.",
        "author": "Matt Zotti",
        "score": 6.2868223
      },
      {
        "id": "NTE3kGwBuLHMiUvv1iFO",
        "quote": "Genuine love should first be directed at oneself if we do not love ourselves, how can we love others?",
        "author": "Dalai Lama",
        "score": 5.236455
      }
    ]
  }
}
```

如您所见，我们决定将结果限制为 3 个，但还有其他 713 个 引文！我们可以通过调用轻松获得接下来的三个引文：

```shell
curl localhost:3000/quotes?text=love&limit=3&page=2
{
  "success": true,
  "data": {
    "results": 716,
    "values": [
      {
        "id": "SsyHkGwBrOFNsaVmePwE",
        "quote": "Forgiveness is choosing to love. It is the first skill of self-giving love.",
        "author": "Mohandas Gandhi",
        "score": 4.93597
      },
      {
        "id": "rDE3kGwBuLHMiUvv1idS",
        "quote": "Neither a lofty degree of intelligence nor imagination nor both together go to the making of genius. Love, love, love, that is the soul of genius.",
        "author": "Wolfgang Amadeus Mozart",
        "score": 4.7821507
      },
      {
        "id": "TjE3kGwBuLHMiUvv1h9K",
        "quote": "Speak low, if you speak love.",
        "author": "William Shakespeare",
        "score": 4.6697206
      }
    ]
  }
}
```

如果您需要插入新引文怎么办？只需调用 /quotes/new 接口！

```shell
curl --request POST \
     --url http://localhost:3000/quotes/new \
     --header 'content-type: application/json' \
     --data '{
        "author": "Michele Riva",
        "quote": "Using Docker and ElasticSearch is challenging, but totally worth it."
}'
```

响应将是：

```json
{
  "success": true,
  "data": {
    "id": "is2QkGwBrOFNsaVmFAi8",
    "author": "Michele Riva",
    "quote": "Using Docker and ElasticSearch is challenging, but totally worth it."
  }
}
```

## 总结

Docker 使管理我们的依赖项及其部署变得异常容易。从那时起，我们可以轻松地将我们的应用程序托管在 [Heroku](https://web.archive.org/web/20210213000221/https://heroku.com/)、[AWS ECS](https://web.archive.org/web/20210213000221/https://aws.amazon.com/ecs/)、[Google Cloud Container](https://web.archive.org/web/20210213000221/https://cloud.google.com/containers/?hl=it) 或任何其他基于 Docker 的服务上，而无需费力地使用它们超复杂的配置来设置我们的服务器。

下一步我们可以做什么？

- 了解如何使用 [Kubernetes](https://web.archive.org/web/20210213000221/https://kubernetes.io/) 扩展您的容器并编排更多 ElasticSearch 实例！
- 创建一个允许您更新现有引文的新接口。可能会发生错误！
- 那么删除引文呢？您将如何实现该接口？
- 用标签保存你的引文会很棒（例如，关于爱情、健康、艺术的报价）……尝试更新你的 `quotes` 索引！

软件开发很有趣。使用 Docker、Node 和 ElasticSearch，效果会更好！
