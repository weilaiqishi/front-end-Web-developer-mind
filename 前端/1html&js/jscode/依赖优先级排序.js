// 分析一个项目的依赖结构，并按依赖优先级排序。
// 已知一个项目的依赖结构，期望在前端通过 loader 的方式异步加载相关的组件，而我们期望依赖在加载的过程中：


// 每一个依赖被加载后都会被立刻执行，那么如果要争取加载一个依赖，则其子依赖都应该优先被加载
// 每一个依赖不希望在钱多出现冗余的情况，若依赖出现多版本的情况，则默认使用更新的版本，比如已知项目依赖结构为（其中 @ 后面的为依赖版本号）：

// ProjectA
// - a@0.1.0
//     - d@0.2.0
//     - c@0.1.0
// - b@0.1.1
//     - e@0.1.2
//     - c@0.1.2
// - c@0.2.0
// 复制代码则其中一种输出的依赖优先级排序为：
// ['d@0.2.0', 'c@0.2.0', 'a@0.1.0', 'e@0.1.2', 'b@0.1.1']
// 输出分析：
// 为了让 a 加载后可以争取执行，则必须先加载 d 和 c，b 的加载同理，又因为在整个依赖关系下，c 的最新版本为 0.2.0 于是有了如上的输出结果。

const npmList = [
    {
        name: 'a@0.1.0',
        deps: [
            {
                name: 'd@0.2.0',
            }, {
                name: 'c@0.1.0'
            }
        ]
    },
    {
        name: 'b@0.1.1',
        deps: [
            {
                name: 'e@0.1.2',
            }, {
                name: 'c@0.1.2'
            }
        ]
    },
    {
        name: 'c@0.2.0'
    }
]

function update(npmList) {
  let versions = {}
  let res = []

  // 比较版本号
  function cmp(a, b) {
    const versionListA = getVersion(a).split('.')
    const versionListB = getVersion(b).split('.')
    for (let index = 0; index < 3; index++) {
      const versionA = parseInt(versionListA[index])
      const versionB = parseInt(versionListB[index])
      if (versionA > versionB) return a
      else if (versionA === versionB) continue
      else return b
    }
    return a
  }

  // 获得版本号
  function getVersion(str) {
    return str.substr(str.indexOf('@') + 1)
  }

  function dfs(npmList) {
    if (npmList.length === 0) return

    npmList.forEach((npm) => {
      const { name, deps = [] } = npm
      // 先遍历他们的依赖
      dfs(deps)
      let key = name.substr(0, name.indexOf('@'))
      // 如果依赖不存在则添加，若已存在，则取最新版
      if (!versions[key]) {
        versions[key] = name
      } else {
        versions[key] = cmp(versions[key], name)
      }
      // 添加进最后的加载列表
      res.push(key)
    })
    return
  }
  dfs(npmList)
  // 去除重复项，然后将包名转换为依赖名，eg: a -> a@0.1.0
  return [...new Set(res)].map(key => versions[key])
}

console.log(update(npmList))