/**
 * Definition for singly-linked list.
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

// 21. 合并两个有序链表
// https://leetcode-cn.com/problems/merge-two-sorted-lists/

// code --- start

// var mergeTwoLists = function (l1, l2) {
//     const res = new ListNode(0, null)
//     let p = res
//     let p1 = l1, p2 = l2
//     while (p1 && p2) {
//         console.log(p)
//         if (p1.val > p2.val) {
//             p.next = p2
//             p2 = p2.next
//         } else {
//             p.next = p1
//             p1 = p1.next
//         }
//         p = p.next
//     }
//     if (p1) {
//         p.next = p1
//     }
//     if (p2) {
//         p.next = p2
//     }
//     return res.next
// };

// const l1 = {
//     val: 1,
//     next: {
//         val: 2,
//         next: {
//             val: 4,
//             next: null
//         }
//     }
// }

// const l2 = {
//     val: 1,
//     next: {
//         val: 3,
//         next: {
//             val: 4,
//             next: null
//         }
//     }
// }

// console.log(mergeTwoLists(l1, l2))

// code --- ends



// 23. 合并K个升序链表
// https://leetcode-cn.com/problems/merge-k-sorted-lists/

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

var mergeKLists = function (lists) {
    if (!lists || !lists.length) { return null }

    // 虚拟头节点
    const dummy = new ListNode(0, null)
    let p = dummy

    // 优先级队列，最小堆 PriorityQueue
    const pg = new Heap((a, b) => a.val < b.val)
    for (const i of lists) {
        if (i) {
            pg.push(i)
        }
    }

    while (pg.size) {
        // 获取最小节点，接到结果链表中
        const node = pg.pop()
        p.next = node
        if (node.next) {
            pg.push(node.next)
        }
        p = p.next
    }
    return dummy.next
};


const lists = [
    {
        val: 1,
        next: {
            val: 4,
            next: {
                val: 5,
                next: null
            }
        }
    },
    {
        val: 1,
        next: {
            val: 3,
            next: {
                val: 4,
                next: null
            }
        }
    },
    {
        val: 2,
        next: {
            val: 6,
            next: {
                val: 7,
                next: null
            }
        }
    }
]

console.log(JSON.stringify(mergeKLists(lists)))