"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeNode = void 0;
class TreeNode {
    constructor(weight, data) {
        this.weight = weight;
        this.data = data !== null && data !== void 0 ? data : null;
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
exports.TreeNode = TreeNode;
