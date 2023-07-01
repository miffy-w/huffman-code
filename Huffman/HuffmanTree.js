"use strict";
/** 输入 number[]，生成哈夫曼树 */
class HuffmanTree {
    constructor(numArr) {
        this.tree = this.createHuffmanTree(numArr.slice());
    }
    preOrder() {
        this.tree.preOrder(this.tree, (node) => {
            var _a, _b;
            console.log('pre node ==> ', { value: node.value, left: (_a = node.left) === null || _a === void 0 ? void 0 : _a.value, right: (_b = node.right) === null || _b === void 0 ? void 0 : _b.value });
        });
    }
    /** 生成树 */
    createHuffmanTree(numArr) {
        let nodeList = numArr.map((item) => {
            return new TreeNode(item);
        });
        while (nodeList.length > 1) {
            /** 先做一下排序，从小到大 */
            nodeList.sort((curNode, nextNode) => curNode.value - nextNode.value);
            const leftNode = nodeList[0];
            const rightNode = nodeList[1];
            const parent = new TreeNode(leftNode.value + rightNode.value);
            parent.left = leftNode;
            parent.right = rightNode;
            nodeList = [parent, ...nodeList.slice(2)];
        }
        return nodeList[0];
    }
}
/** 结点 */
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
    /** 前序遍历 */
    preOrder(node, callback) {
        if (node) {
            callback(node);
            this.preOrder(node.left, callback);
            this.preOrder(node.right, callback);
        }
    }
}
const nums = [24, 36, 44, 66, 44, 24];
const huffmanTree = new HuffmanTree(nums);
/** 前序遍历 */
huffmanTree.preOrder();
