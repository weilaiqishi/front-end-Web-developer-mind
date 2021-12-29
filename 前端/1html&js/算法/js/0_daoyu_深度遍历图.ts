// https://labuladong.gitee.io/algo/1/7/

/**
 * 二维矩阵的 DFS 代码框架
 * 与二叉树的遍历框架类似
 */

// 二叉树遍历框架
// function traverse(root) {
//     traverse(root.left)
//     traverse(root.right)
// }

// 二维矩阵遍历框架
// function dfs(grid: number[][], i: number, j: number, visited: boolean[]): void {
//     const m: number = grid.length, n = grid[0].length
//     if (i < 0 || j < 0 || i >= m || j >= n) {
//         // 超出索引边界
//         return;
//     }
//     if (visited[i][j]) {
//         // 已遍历过 (i, j)
//         return;
//     }
//     // 进入节点 (i, j)
//     visited[i][j] = true;
//     dfs(grid, i - 1, j, visited); // 上
//     dfs(grid, i + 1, j, visited); // 下
//     dfs(grid, i, j - 1, visited); // 左
//     dfs(grid, i, j + 1, visited); // 右
// }

// 使用「方向数组」来处理上下左右的遍历
// const dirs: number[][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]
// function dfs(grid: number[][], i: number, j: number, visited: boolean[]): void {
//     const m: number = grid.length, n = grid[0].length
//     if (i < 0 || j < 0 || i >= m || j >= n) {
//         // 超出索引边界
//         return;
//     }
//     if (visited[i][j]) {
//         // 已遍历过 (i, j)
//         return;
//     }
//     // 进入节点 (i, j)
//     visited[i][j] = true;
//     for (const d of dirs) {
//         const next_i = i + d[0];
//         const next_j = j + d[1];
//         dfs(grid, next_i, next_j, visited);
//     }
// }



/**
 * 力扣第 200 题「岛屿数量」
 * 题目会输入一个二维数组 grid，其中只包含 0 或者 1，0 代表海水，1 代表陆地，且假设该矩阵四周都是被海水包围着的。
 */

// function numIslands(grid: string[][]): number {
//     let res = 0
//     const m = grid.length, n = grid[0].length
//     // 遍历 grid
//     for (let i = 0; i < m; i++) {
//         for (let j = 0; j < n; j++) {
//             if (grid[i][j] == '1') {
//                 // 每发现一个岛屿，岛屿数量加一
//                 res++;
//                 // 然后使用 DFS 将岛屿淹了
//                 // 为什么每次遇到岛屿，都要用 DFS 算法把岛屿「淹了」呢？主要是为了省事，避免维护 visited 数组。
//                 // 因为 dfs 函数遍历到值为 0 的位置会直接返回，所以只要把经过的位置都设置为 0，就可以起到不走回头路的作用。
//                 dfs(grid, i, j);
//             }
//         }
//     }
//     return res
// }

// function dfs(grid: string[][], i: number, j: number) {
//     const m = grid.length, n = grid[0].length
//     if (i < 0 || j < 0 || i >= m || j >= n) {
//         // 超出索引边界
//         return;
//     }
//     if (grid[i][j] == '0') {
//         // 已经是海水了
//         return;
//     }
//     // 将 (i, j) 变成海水
//     grid[i][j] = '0';
//     // 淹没上下左右的陆地
//     dfs(grid, i + 1, j);
//     dfs(grid, i, j + 1);
//     dfs(grid, i - 1, j);
//     dfs(grid, i, j - 1);
// }

// const grid = [
//     ["1", "1", "1", "1", "0"],
//     ["1", "1", "0", "1", "0"],
//     ["1", "1", "0", "0", "0"],
//     ["0", "0", "0", "0", "0"]
// ]
// console.log(numIslands(grid))



/**
 * 力扣第 1254 题「统计封闭岛屿的数目」https://leetcode-cn.com/problems/number-of-closed-islands/submissions/
 * 和上一题有两点不同：
 * 1、用 0 表示陆地，用 1 表示海水。
 * 2、让你计算「封闭岛屿」的数目。所谓「封闭岛屿」就是上下左右全部被 1 包围的 0，也就是说靠边的陆地不算作「封闭岛屿」。
 * 把上一题中那些靠边的岛屿排除掉，剩下的就是「封闭岛屿」
 */

// function closedIsland(grid: number[][]): number {
//     const m = grid.length, n = grid[0].length

//     // 把边上的陆地变成海水
//     for (let j = 0; j < n; j++) {
//         // 把靠上边的岛屿淹掉
//         dfs(grid, 0, j)
//         // 把靠下边的岛屿淹掉
//         dfs(grid, m - 1, j)
//     }
//     for (let i = 0; i < m; i++) {
//         // 把靠左边的岛屿淹掉
//         dfs(grid, i, 0)
//         // 把靠右边的岛屿淹掉
//         dfs(grid, i, n - 1)
//     }
//     // 遍历 grid，剩下的岛屿都是封闭岛屿
//     let res = 0
//     for (let i = 0; i < m; i++) {
//         for (let j = 0; j < n; j++) {
//             if (grid[i][j] == 0) {
//                 res++
//                 dfs(grid, i, j)
//             }
//         }
//     }
//     return res
// }

// function dfs(grid: number[][], i: number, j: number) {
//     const m = grid.length, n = grid[0].length
//     if (i < 0 || j < 0 || i >= m || j >= n) {
//         return
//     }
//     if (grid[i][j] == 1) {
//         // 已经是海水了
//         return
//     }
//     // 将 (i, j) 变成海水
//     grid[i][j] = 1;
//     // 淹没上下左右的陆地
//     dfs(grid, i + 1, j);
//     dfs(grid, i, j + 1);
//     dfs(grid, i - 1, j);
//     dfs(grid, i, j - 1);
// }

// const grid = [[1, 1, 1, 1, 1, 1, 1, 0], [1, 0, 0, 0, 0, 1, 1, 0], [1, 0, 1, 0, 1, 1, 1, 0], [1, 0, 0, 0, 0, 1, 0, 1], [1, 1, 1, 1, 1, 1, 1, 0]]
// console.log(closedIsland(grid))



/**
 * 力扣第 1020 题「飞地的数量」https://leetcode-cn.com/problems/number-of-enclaves/
 * 求封闭岛屿的面积总和。
 * 稍微改改就可以解决
 * 注意第 1020 题中 1 代表陆地，0 代表海水
 */

// function numEnclaves(grid: number[][]): number {
//     const m = grid.length, n = grid[0].length

//     // 把边上的陆地变成海水
//     for (let j = 0; j < n; j++) {
//         // 把靠上边的岛屿淹掉
//         dfs(grid, 0, j)
//         // 把靠下边的岛屿淹掉
//         dfs(grid, m - 1, j)
//     }
//     for (let i = 0; i < m; i++) {
//         // 把靠左边的岛屿淹掉
//         dfs(grid, i, 0)
//         // 把靠右边的岛屿淹掉
//         dfs(grid, i, n - 1)
//     }
//     // 遍历 grid，剩下的岛屿都是封闭岛屿
//     let res = 0
//     for (let i = 0; i < m; i++) {
//         for (let j = 0; j < n; j++) {
//             if (grid[i][j] == 1) {
//                 res++
//             }
//         }
//     }
//     return res
// }

// function dfs(grid: number[][], i: number, j: number) {
//     const m = grid.length, n = grid[0].length
//     if (i < 0 || j < 0 || i >= m || j >= n) {
//         return
//     }
//     if (grid[i][j] == 0) {
//         // 已经是海水了
//         return
//     }
//     // 将 (i, j) 变成海水
//     grid[i][j] = 0;
//     // 淹没上下左右的陆地
//     dfs(grid, i + 1, j);
//     dfs(grid, i, j + 1);
//     dfs(grid, i - 1, j);
//     dfs(grid, i, j - 1);
// }

// const grid = [[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]
// console.log(numEnclaves(grid))



/**
 * 力扣第 695 题「岛屿的最大面积」
 * 0 表示海水，1 表示陆地
 * 现在不让你计算岛屿的个数了，而是让你计算最大的那个岛屿的面积
 * dfs 函数淹没岛屿的同时，还应该想办法记录这个岛屿的面积
 */
function maxAreaOfIsland(grid: number[][]): number {
    let res = 0;
    const m = grid.length, n = grid[0].length
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (grid[i][j] === 1) {
                // 淹没岛屿，并更新最大岛屿面积
                res = Math.max(res, dfs(grid, i, j));
            }
        }
    }
    return res
}

function dfs(grid: number[][], i: number, j: number): number {
    const m = grid.length, n = grid[0].length
    if (i < 0 || j < 0 || i >= m || j >= n) {
        // 超出索引边界
        return 0
    }
    if (grid[i][j] == 0) {
        // 已经是海水了
        return 0
    }
    // 将 (i, j) 变成海水
    grid[i][j] = 0;
    return dfs(grid, i + 1, j)
        + dfs(grid, i, j + 1)
        + dfs(grid, i - 1, j)
        + dfs(grid, i, j - 1) + 1;
}

const grid = [[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0], [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]]
console.log(maxAreaOfIsland(grid))