// base

class Heap {
    constructor(compare) {
        this.arr = [0]; // 下标从1开始好算，下标0废弃
        this.compare = (typeof compare === 'function') ? compare : this._defaultCompare;
    }

    /**
     * 根据可迭代对象生成堆
     * @param {*} data iterable 对象
     * @param {*} compare
     */
    static heapify(data, compare = undefined) {
        const heap = new Heap(compare);
        for (const item of data) {
            heap.push(item);
        }
        return heap;
    }

    push(item) {
        const { arr } = this;
        arr.push(item);
        this._up(arr.length - 1);
        // console.log('push', item, arr.slice(1));
    }

    pop() {
        if (this.size === 0) return null; //行为同Java的PriorityQueue
        const { arr } = this;
        this._swap(1, arr.length - 1);// 末尾的换上来，堆顶放到最后等待返回
        const res = arr.pop();
        this._down(1);// 换上来的末尾尝试下沉
        return res;
    }

    /**
     * 堆中元素数量
     */
    get size() {
        return this.arr.length - 1;
    }

    /**
     * 返回堆顶元素
     */
    peek() {
        return this.arr[1];
    }

    /**
     * 上浮第k个元素
     * @param {int} k
     */
    _up(k) {
        const { arr, compare, _parent } = this;
        // k 比它的父节点更靠近堆顶，应该继续上浮（k=1 表示已经到达堆顶）
        while (k > 1 && compare(arr[k], arr[_parent(k)])) {
            this._swap(_parent(k), k);
            k = _parent(k);
        }
    }

    /**
     * 下沉第k个元素
     * @param {int} k
     */
    _down(k) {
        const { arr, compare, _left, _right, size } = this;
        // 如果沉到堆底，就沉不下去了
        while (_left(k) <= size) {
            let child = _left(k);
            if (_right(k) <= size && compare(arr[_right(k)], arr[child])) {
                child = _right(k); // 选择左右子节点中更靠近堆顶的，这样能维持下沉后原本的 left与right 之间的顺序关系
            }
            // 如果当前的k比子节点更靠近堆顶，不用下沉了
            if (compare(arr[k], arr[child])) return;
            // 下沉
            this._swap(k, child);
            k = child;
        }
    }

    _left(k) { return k * 2; }
    _right(k) { return k * 2 + 1; }
    _parent(k) { return Math.floor(k / 2); }

    /**
     * 交换位置
     * @param {int} i
     * @param {int} j
     */
    _swap(i, j) {
        const arr = this.arr;
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    /**
     * a是否比b更接近堆顶，默认为小顶堆
     * @param {*} a
     * @param {*} b
     * @return {boolean}
     */
    _defaultCompare(a, b) {
        return a < b;
    }
}



// 743. 网络延迟时间
// https://leetcode-cn.com/problems/network-delay-time/

// code --- start

// var networkDelayTime = (times, n, k) => {
//     // 构造图
//     // from -> List<(to, weight)>
//     // 邻接表存储图结构，同时存储权重信息
//     const graph = []
//     for (let i = 1; i <= n; i++) {
//         graph[i] = []
//     }
//     for (const time of times) {
//         node = {
//             to: time[1],
//             weight: time[2],
//         }
//         graph[time[0]].push(node)
//     }
//     // 启动 dijkstra 算法计算以节点 k 为起点到其他节点的最短路径
//     const distTo = dijkstra(k, graph);

//     // 找到最长的那一条最短路径
//     let res = 0;
//     for (let i = 1; i < distTo.length; i++) {
//         if (distTo[i] == Infinity) {
//             // 有节点不可达，返回 -1
//             return -1;
//         }
//         res = Math.max(res, distTo[i]);
//     }
//     return res;
// };

// class State {
//     constructor(id, distFromStart) {
//         // 图节点的 id
//         this.id = id;
//         // 从 start 节点到当前节点的距离
//         this.distFromStart = distFromStart;
//     }
// }

// function dijkstra(start, graph) {
//     // 定义：distTo[i] 的值就是起点 start 到达节点 i 的最短路径权重
//     const distTo = []
//     Object.keys(graph).forEach(key => distTo[key] = Infinity)
//     // base case，start 到 start 的最短距离就是 0
//     distTo[start] = 0;

//     // 优先级队列，distFromStart 较小的排在前面
//     const priorityQueue = new Heap((a, b) => a.distFromStart < b.distFromStart);
//     // 从起点 start 开始进行 BFS
//     priorityQueue.push(new State(start, 0));

//     while (priorityQueue.size) {
//         const curState = priorityQueue.pop();
//         const curNodeID = curState.id;
//         const curDistFromStart = curState.distFromStart;

//         if (curDistFromStart > distTo[curNodeID]) {
//             continue;
//         }

//         // 将 curNode 的相邻节点装入队列
//         for (const neighbor of graph[curNodeID]) {
//             const nextNodeID = neighbor.to;
//             const distToNextNode = distTo[curNodeID] + neighbor.weight;
//             // 更新 dp table
//             if (distTo[nextNodeID] > distToNextNode) {
//                 distTo[nextNodeID] = distToNextNode;
//                 priorityQueue.push(new State(nextNodeID, distToNextNode));
//             }
//         }
//     }
//     return distTo;
// }

// const time = [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n = 4, k = 2
// console.log(networkDelayTime(time, n, k))

// code --- end



// 1631. 最小体力消耗路径
// https://leetcode-cn.com/problems/path-with-minimum-effort/

// code --- start

// // 方向数组，上下左右的坐标偏移量
// const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]

// function adj(matrix, x, y) {
//     const m = matrix.length, n = matrix[0].length
//     const neighbors = []
//     for (const dir of dirs) {
//         const nx = x + dir[0], ny = y + dir[1]
//         if (nx >= m || nx < 0 || ny >= n || ny < 0) {
//             continue
//         }
//         neighbors.push([nx, ny]);
//     }
//     return neighbors
// }

// class State {
//     constructor(x, y, effortFromStart) {
//         // 矩阵中的一个位置
//         this.x = x;
//         this.y = y;
//         // 从起点 (0, 0) 到当前位置的最小体力消耗（距离）
//         this.effortFromStart = effortFromStart;
//     }
// }


// /**
//  * @param {number[][]} heights
//  * @return {number}
//  */
// var minimumEffortPath = function (heights) {
//     const m = heights.length, n = heights[0].length;
//     // 定义：从 (0, 0) 到 (i, j) 的最小体力消耗是 effortTo[i][j]
//     const effortTo = [];
//     for (let i = 0; i < m; i++) {
//         effortTo[i] = new Array(n).fill(Infinity)
//     }
//     // base case，起点到起点的最小消耗就是 0
//     effortTo[0][0] = 0;

//     // 优先级队列，effortFromStart 较小的排在前面
//     const pq = new Heap((a, b) => a.effortFromStart < b.effortFromStart)
//     // 从起点 (0, 0) 开始进行 BFS
//     pq.push(new State(0, 0, 0))

//     while (pq.size) {
//         const curState = pq.pop()
//         const curX = curState.x, curY = curState.y, curEffortFromStart = curState.effortFromStart

//         // 到达终点提前结束
//         if (curX === m - 1 && curY === n - 1) {
//             return curEffortFromStart
//         }

//         if (curEffortFromStart > effortTo[curX][curY]) {
//             continue
//         }

//         // 将相邻坐标装入队列
//         for (const neighbor of adj(heights, curX, curY)) {
//             const nextX = neighbor[0], nextY = neighbor[1]
//             // 计算从 (curX, curY) 达到 (nextX, nextY) 的消耗
//             const effortToNextNode = Math.max(effortTo[curX][curY], Math.abs(heights[curX][curY] - heights[nextX][nextY]))

//             // 更新 dp table
//             if (effortTo[nextX][nextY] > effortToNextNode) {
//                 effortTo[nextX][nextY] = effortToNextNode;
//                 pq.push(new State(nextX, nextY, effortToNextNode));
//             }
//         }
//     }

//     // 正常情况不会达到这个 return
//     return -1;
// };
// const heights = [[1, 2, 3], [3, 8, 4], [5, 3, 5]]

// console.log(minimumEffortPath(heights))

// code --- end



// 1514. 概率最大的路径
// https://leetcode-cn.com/problems/path-with-maximum-probability/

// code --- start

/**
 * @param {number} n
 * @param {number[][]} edges
 * @param {number[]} succProb
 * @param {number} start
 * @param {number} end
 * @return {number}
 */
var maxProbability = function (n, edges, succProb, start, end) {
    const graph = []
    for (let i = 0; i < n; i++) {
        graph[i] = []
    }
    // 构造邻接表结构表示图
    for (let i = 0; i < edges.length; i++) {
        const from = edges[i][0]
        const to = edges[i][1]
        const weight = succProb[i]
        // 无向图就是双向图
        graph[from].push([to, weight])
        graph[to].push([from, weight])
    }
    return dijkstra(start, end, graph);
};

class State {
    constructor(id, probFromStart) {
        // 图节点的 id
        this.id = id;
        // 从 start 节点到达当前节点的概率
        this.probFromStart = probFromStart;
    }
}

function dijkstra(start, end, graph) {
    // 定义：probTo[i] 的值就是节点 start 到达节点 i 的最大概率
    // dp table 初始化为一个取不到的最小值
    const probTo = new Array(graph.length).fill(-1)
    probTo[start] = 1;

    // 优先级队列，probFromStart 较大的排在前面
    const pq = new Heap((a, b) => a.probFromStart > b.probFromStart)
    // 从起点 start 开始进行 BFS
    pq.push(new State(start, 1))

    while (pq.size) {
        const curState = pq.pop()
        const curNodeID = curState.id
        const curProbFromStart = curState.probFromStart;

        // 遇到终点提前返回
        if (curNodeID == end) {
            return curProbFromStart;
        }

        if (curProbFromStart < probTo[curNodeID]) {
            // 已经有一条概率更大的路径到达 curNode 节点了
            continue;
        }

        // 将 curNode 的相邻节点装入队列
        for (const neighbor of graph[curNodeID]) {
            const nextNodeID = neighbor[0]
            // 看看从 curNode 达到 nextNode 的概率是否会更大
            probToNextNode = probTo[curNodeID] * neighbor[1]
            if (probTo[nextNodeID] < probToNextNode) {
                probTo[nextNodeID] = probToNextNode;
                pq.push(new State(nextNodeID, probToNextNode));
            }
        }
    }

    // 如果到达这里，说明从 start 开始无法到达 end，返回 0
    return 0.0;
}

const n = 3, edges = [[0, 1], [1, 2], [0, 2]], succProb = [0.5, 0.5, 0.2], start = 0, end = 2
console.log(maxProbability(n, edges, succProb, start, end))

// code --- end