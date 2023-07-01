
/** 输入 number[]，生成哈夫曼树 */
class HuffmanTree {

    tree: TreeNode;
    constructor(numArr: Array<number>) {
        this.tree = this.createHuffmanTree(numArr.slice());
    }

    public preOrder () {
        this.tree.preOrder(this.tree, (node) => {
            console.log('pre node ==> ', 
                { value: node.value, left: node.left?.value, right: node.right?.value }
            );
        });
    }

    /** 生成树 */
    public createHuffmanTree(numArr: Array<number>) {
        let nodeList = numArr.map((item) => {
            return new TreeNode(item);
        });

        while(nodeList.length > 1) {
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
    left: TreeNode | null;
    right: TreeNode | null;
    constructor (public value: number) {
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

const nums = [24, 36, 44, 66, 44, 24];

const huffmanTree = new HuffmanTree(nums);

/** 前序遍历 */
huffmanTree.preOrder();
