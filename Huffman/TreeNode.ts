export class TreeNode<T = any> {
    /** 权重 */
    weight: number;
    /** 数据 */
    data: T | null;
    left: TreeNode<T> | null;
    right: TreeNode<T> | null;

    constructor(weight: number, data?: T) {
        this.weight = weight;
        this.data = data ?? null;
        this.left = null;
        this.right = null;
    }

    /** 前序遍历 */
    public preOrder (node: TreeNode, callback: (node: TreeNode) => void) {
        if (node) {
            callback(node);
            this.preOrder(node.left as TreeNode, callback);
            this.preOrder(node.right as TreeNode, callback);
        }
    }
}
