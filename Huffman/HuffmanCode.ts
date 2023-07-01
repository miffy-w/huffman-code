type Bit = '0' | '1';

export class HuffmanCode {
    public readonly tree: TreeNode<number>;

    /** 编码表 */
    public readonly codeTable = new Map<number, string>();

    /** 压缩后的 int8Array 数据 */
    public zipData: Int8Array;

    /** 要压缩的文本 */
    constructor(content: string) {
        /** 统计文本次数 */
        const charMap = this.statisticChar(content);
        this.tree = this.createHuffmanTree(charMap);

        /** 生成编码表 */
        const bytesStr = this.getCodes(this.tree);
        console.log('bytesStr ====> ', bytesStr);

        /** 生成压缩数据 */
        this.zipData = this.zip(content, this.codeTable);
    }

    /** 查看编码表 */
    public logCodeTable () {
        this.codeTable.forEach((value, key) => {
            console.log(`${String.fromCharCode(key)} (${key}): ${value}`);
        });
    }

    /** 打印前序遍历结果 */
    public logPreOrder () {
        this.tree.preOrder(this.tree, (node) => {
            console.log('pre node ==> ', 
                {
                    value: { data: node.data, weight: node.weight,
                        char: String.fromCharCode(node.data) },
                    left: { data: node.left?.data, weight: node.left?.weight,
                        char: String.fromCharCode(node.left?.data) },
                    right: { data: node.right?.data, weight: node.right?.weight,
                        char: String.fromCharCode(node.right?.data) },
                }
            );
        });
    }

    /** 拿到编码表，一个 Map 类型，key 是 Unicode，value 是二进制码 */
    private getCodes(node: TreeNode<number> | null) {
        let codeBuilder = '';
        const builder = (node: TreeNode<number> | null, code: Bit | '' = '', codeStr = '') => {
            if (node) {
                codeStr += code;
                if (node.data === null) {
                    builder(node.left, '0', codeStr);
                    builder(node.right, '1', codeStr);
                } else {
                    this.codeTable.set(node.data, codeStr);
                }
            }
        }
        builder(node);
        return codeBuilder;
    }

    public statisticChar(str: string) {
        /** key 是字符对应的 Unicode 码，value 是权值 */
        const charMap = new Map<number, number>();
        for (let i = 0, len = str.length; i < len; i ++) {
            const unicode = str[i].charCodeAt(0);
            const count = charMap.get(unicode);
            charMap.set(unicode, count ? count + 1 : 1);
        }
        return charMap;
    }

    /** 生成 Huffman 树 */
    public createHuffmanTree(charMap: Map<number, number>) {
        let nodeList: TreeNode<number>[] = [];
        charMap.forEach((value, key) => {
            nodeList.push(new TreeNode(value, key));
        });

        while(nodeList.length > 1) {
            /** 先做一下排序，从小到大 */
            nodeList.sort((curNode, nextNode) => curNode.weight - nextNode.weight);

            const leftNode = nodeList[0];
            const rightNode = nodeList[1];
            /** 父结点不没有 data */
            const parent = new TreeNode(leftNode.weight + rightNode.weight);
            parent.left = leftNode;
            parent.right = rightNode;
            nodeList = [parent, ...nodeList.slice(2)];
        }
        return nodeList[0];
    }

    /**
     * 压缩函数
     * @param contentBytes 原始的文本数据
     * @param huffmanBytes 编码表
    */
    private zip (content: string, huffmanBytes: Map<number, string>) {
        let byteStr = '';     // 二进制字符串
        for (let s of content) {
            const code = huffmanBytes.get(s.charCodeAt(0));
            code && (byteStr += code);
        }
        const huffmanBytesLen = byteStr.length;
        const len = Math.ceil(huffmanBytesLen / 8);
        /** 生成二进制补码 8 位有符号整数的数组 */
        const int8Arr = new Int8Array(len);
        let index = 0;
        for (let i = 0; i < huffmanBytesLen; i += 8) {
            const str = byteStr.slice(i, i + 8);
            int8Arr[index] = parseInt(str, 2);
            index += 1;
        }
        return int8Arr;
    }
}

class TreeNode<T = any> {
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

const huffmanCode = new HuffmanCode('hello world!!');

// /** 前序遍历 */
// // huffmanCode.preOrder();

huffmanCode.logCodeTable();

const { zipData } = huffmanCode;

console.log('zipData: ', zipData);

// fs.writeFileSync('./huffman', zipData);


/**
 * 读取文件进行压缩 
*/

// const text = readFileSync('./HuffmanTree.js');

// const huff = new HuffmanCode(text.toString());

// fs.writeFileSync('./HuffmanTree.zip', huff.zipData);
