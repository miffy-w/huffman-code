"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuffmanCode = void 0;
class HuffmanCode {
    /** 要压缩的文本 */
    constructor(content) {
        /** 编码表 */
        this.codeTable = new Map();
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
    logCodeTable() {
        this.codeTable.forEach((value, key) => {
            console.log(`${String.fromCharCode(key)} (${key}): ${value}`);
        });
    }
    /** 打印前序遍历结果 */
    logPreOrder() {
        this.tree.preOrder(this.tree, (node) => {
            var _a, _b, _c, _d, _e, _f;
            console.log('pre node ==> ', {
                value: { data: node.data, weight: node.weight,
                    char: String.fromCharCode(node.data) },
                left: { data: (_a = node.left) === null || _a === void 0 ? void 0 : _a.data, weight: (_b = node.left) === null || _b === void 0 ? void 0 : _b.weight,
                    char: String.fromCharCode((_c = node.left) === null || _c === void 0 ? void 0 : _c.data) },
                right: { data: (_d = node.right) === null || _d === void 0 ? void 0 : _d.data, weight: (_e = node.right) === null || _e === void 0 ? void 0 : _e.weight,
                    char: String.fromCharCode((_f = node.right) === null || _f === void 0 ? void 0 : _f.data) },
            });
        });
    }
    /** 拿到编码表，一个 Map 类型，key 是 Unicode，value 是二进制码 */
    getCodes(node) {
        let codeBuilder = '';
        const builder = (node, code = '', codeStr = '') => {
            if (node) {
                codeStr += code;
                if (node.data === null) {
                    builder(node.left, '0', codeStr);
                    builder(node.right, '1', codeStr);
                }
                else {
                    this.codeTable.set(node.data, codeStr);
                }
            }
        };
        builder(node);
        return codeBuilder;
    }
    statisticChar(str) {
        /** key 是字符对应的 Unicode 码，value 是权值 */
        const charMap = new Map();
        for (let i = 0, len = str.length; i < len; i++) {
            const unicode = str[i].charCodeAt(0);
            const count = charMap.get(unicode);
            charMap.set(unicode, count ? count + 1 : 1);
        }
        return charMap;
    }
    /** 生成 Huffman 树 */
    createHuffmanTree(charMap) {
        let nodeList = [];
        charMap.forEach((value, key) => {
            nodeList.push(new TreeNode(value, key));
        });
        while (nodeList.length > 1) {
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
    zip(content, huffmanBytes) {
        let byteStr = ''; // 二进制字符串
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
exports.HuffmanCode = HuffmanCode;
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
