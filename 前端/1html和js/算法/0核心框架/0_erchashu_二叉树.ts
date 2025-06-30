// https://labuladong.gitee.io/algo/1/7/



// 前中后序
// 单链表和数组的遍历可以是迭代的，也可以是递归的，二叉树这种结构无非就是二叉链表，不过没办法简单改写成迭代形式，所以一般说二叉树的遍历框架都是指递归的形式。
// 只要是递归形式的遍历，都会有一个前序和后序位置，分别在递归之前和之后。
// 本质上是利用递归的堆栈
// 前序位置的代码在刚刚进入一个二叉树节点的时候执行；
// 后序位置的代码在将要离开一个二叉树节点的时候执行；
// 中序位置的代码在一个二叉树节点左子树都遍历完，即将开始遍历右子树的时候执行。
// 多叉树没有中序位置，因为二叉树的每个节点只会进行唯一一次左子树切换右子树，而多叉树节点可能有很多子节点，会多次切换子树去遍历，所以多叉树节点没有「唯一」的中序遍历位置
// function traverse(root) {
//     if (root == null) {
//         return;
//     }
//     // 前序位置
//     traverse(root.left);
//     // 中序位置
//     traverse(root.right);
//     // 后序位置
// }

// --- start 二叉树非递归遍历
function preorderTraversal (root) {
    const nodeStack: any[] = [root]
    const res: any[] = []
    if (!root) {
        return res
    }
    while(nodeStack.length) {
        const node = nodeStack.pop()
        res.push(node)
        if (node.right) {
            nodeStack.push(node.right)
        }
        if (node.left) {
            nodeStack.push(node.left)
        }
    }
    return res
}

function inorderTraversal (root) {
    const nodeStack: any[] = [root]
    const res: any[] = []
    if (!root) {
        return res
    }
    let center = root
    while (nodeStack.length && center) {
        while (center !== null) {
            nodeStack.push(center)
            center = center.left
        }
        center = nodeStack.pop()
        res.push(center.val)
        center = center.right
    }
    return res
}

function postorderTraversal (root) {
    const nodeStack: any[] = [root]
    const res: any[] = []
    if (root !== null) {
        return []
    }
    nodeStack.push(root)
    while (nodeStack.length > 0) {
        const node = nodeStack.pop()
        res.unshift(node.val)
        if (node.left) {
            nodeStack.push(node.left)
            nodeStack.push(node.right)
        }
    }
}
// --- end 二叉树非递归遍历



// 二叉树题目的递归解法可以分两类思路，第一类是遍历一遍二叉树得出答案，第二类是通过分解问题计算出答案，这两类思路分别对应着 回溯算法核心框架 和 动态规划核心框架。



/**
 * 力扣第 104 题「二叉树的最大深度」
 * https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/
 * 所谓最大深度就是根节点到「最远」叶子节点的最长路径上的节点数
 * 显然遍历一遍二叉树，用一个外部变量记录每个节点所在的深度，取最大值就可以得到最大深度
 */

// 解法一
// 前序位置是进入一个节点的时候，后序位置是离开一个节点的时候
// 在前序位置增加 depth，在后序位置减小 depth
// function maxDepth(root) {
//     let res = 0
//     // 记录遍历到的节点的深度
//     let depth = 0

//     // 二叉树遍历框架
//     function traverse(root) {
//         if (root == null) {
//             // 到达叶子节点，更新最大深度
//             res = Math.max(res, depth);
//             return;
//         }
//         // 前序位置
//         depth++;
//         traverse(root.left);
//         traverse(root.right);
//         // 后序位置
//         depth--;
//     }

//     traverse(root);
//     return res;
// }

// 解法二
// 一棵二叉树的最大深度可以通过子树的最大高度推导出来，这就是分解问题计算答案的思路。
// 为什么主要的代码逻辑集中在后序位置？
// 要首先利用递归函数的定义算出左右子树的最大深度，然后推出原树的最大深度，主要逻辑自然放在后序位置。
// function maxDepth(root) {
//     if (root == null) {
//         return 0;
//     }
//     // 利用定义，计算左右子树的最大深度
//     let leftMax = maxDepth(root.left);
//     let rightMax = maxDepth(root.right);
//     // 整棵树的最大深度等于左右子树的最大深度取最大值，
//     // 然后再加上根节点自己
//     return Math.max(leftMax, rightMax) + 1;
// }



/**
 * 力扣 144. 二叉树的前序遍历
 * https://leetcode-cn.com/problems/binary-tree-preorder-traversal/
 */

// 「遍历」思路
// function preorderTraversal(root) {
//     const res = []
//     traverse(root, res)
//     return res
// }
// function traverse(root, res) {
//     if (root == null) {
//         return;
//     }
//     // 前序位置
//     res.push(root.val);
//     traverse(root.left, res);
//     traverse(root.right, res);
// }

// 「分解问题」
// 不要用像 traverse 这样的辅助函数和任何外部变量
// 纯用题目给的 preorderTraverse 函数递归解题
// 这个解法短小精干，但为什么不常见呢
// 一个原因是这个算法的复杂度不好把控
// Java 的话无论 ArrayList 还是 LinkedList，addAll 方法的复杂度都是 O(N)，所以总体的最坏时间复杂度会达到 O(N^2)，除非你自己实现一个复杂度为 O(1) 的 addAll 方法，底层用链表的话并不是不可能。
// function preorderTraversal(root) {
//     let res = [];
//     if (root == null) {
//         return res;
//     }
//     // 前序遍历的结果，root.val 在第一个
//     res.push(root.val);
//     // 利用函数定义，后面接着左子树的前序遍历结果
//     res = res.concat(preorderTraversal(root.left));
//     // 利用函数定义，最后接着右子树的前序遍历结果
//     res = res.concat(preorderTraversal(root.right));
//     return res
// }



/**
 * 力扣第 543 题「二叉树的直径」
 * https://leetcode-cn.com/problems/diameter-of-binary-tree/
 * 
 * 只有后序位置才能通过返回值获取子树的信息
 * 如 每个节点的左右子树各有多少节点
 * 一旦你发现题目和子树有关，那大概率要给函数设置合理的定义和返回值，在后序位置写代码了。
 * 
 * 所谓二叉树的「直径」长度，就是任意两个结点之间的路径长度
 * 每一条二叉树的「直径」长度，就是一个节点的左右子树的最大深度之和。
 */

function diameterOfBinaryTree(root) {
    // 记录最大直径的长度
    let maxDiameter = 0;
    maxDepth(root);

    function maxDepth(root) {
        if (root == null) {
            return 0;
        }
        const leftMax = maxDepth(root.left);
        const rightMax = maxDepth(root.right);
        // 后序位置顺便计算最大直径
        const myDiameter = leftMax + rightMax;
        maxDiameter = Math.max(maxDiameter, myDiameter);

        return 1 + Math.max(leftMax, rightMax);
    }
    return maxDiameter;
}

