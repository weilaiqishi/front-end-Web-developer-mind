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

let head = {
    val: 1,
    next: {
        val: 2,
        next: {
            val: 3,
            next: {
                val: 4,
                next: {
                    val: 5,
                    next: null
                }
            }
        }
    }
}

// 19.单链表的倒数第 k 个节点
// https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list/submissions/

// code --- start

// var removeNthFromEnd = function (head, n) {
//     // 虚拟头结点
//     const dummy = new ListNode(0, head)
//     let p1 = dummy, p2 = dummy
//     for (let i = 0; i < n + 1; i++) {
//         p1 = p1.next
//     }
//     while (p1) {
//         p1 = p1.next
//         p2 = p2.next
//     }
//     // console.log(p1, p2)
//     if (p2) { p2.next = p2.next.next }
//     return dummy.next
// };

// console.log(JSON.stringify(removeNthFromEnd(head, 2)))

// code --- end



// 876.链表的中间结点
// https://leetcode-cn.com/problems/middle-of-the-linked-list/

// code --- start

// var middleNode = function(head) {
//     let p1 = head, p2 = head
//     while (p1 && p1.next) {
//         p2 = p2.next
//         p1  = p1.next.next
//     }
//     return p2
// };

// console.log(middleNode(head))

// code --- end



// 141. 环形链表
// https://leetcode-cn.com/problems/linked-list-cycle/

// code --- start

// var hasCycle = function(head) {
//     let p1 = head, p2 = head
//     while(p1 && p1.next) {
//         p1 = p1.next.next
//         p2 = p2.next
//         if (p1 === p2) {
//             return true
//         }
//     }
//     return false
// };

// code --- end



// 142. 环形链表 II
// https://leetcode-cn.com/problems/linked-list-cycle-ii/

// code --- start

// var detectCycle = function (head) {
//     let p1 = head, p2 = head
//     while (p1 && p1.next) {
//         p1 = p1.next.next
//         p2 = p2.next
//         if (p1 === p2) {
//             break
//         }
//     }
//     // fast 遇到空指针说明没有环
//     if (!p1 || !p1.next) { return null }

//     // 重新指向头节点
//     p2 = head
//     // 快慢指针同步前进，相交点就是环起点
//     while (p1 !== p2) {
//         p1 = p1.next
//         p2 = p2.next
//     }
//     return p2
// };

// code --- end



// 160. 相交链表
// https://leetcode-cn.com/problems/intersection-of-two-linked-lists/

// code --- start

var getIntersectionNode = function(headA, headB) {
    let p1 = headA, p2 = headB
    while (p1 !== p2) {
        if (p1) { p1 = p1.next }
        else { p1 = headB }
        if (p2) { p2 = p2.next }
        else { p2 = headA }
    }
    return p1
};

// code --- end