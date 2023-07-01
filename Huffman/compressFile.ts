import fs from 'node:fs';
import { TreeNode } from './TreeNode';

const { readFile, writeFile } = fs.promises;

class CompressFile {

    /** 编码表 */
    codingTable = new Map<number, string>();
    /** 统计字符个数 */
    byteNumMap = new Map<number, number>();
    /** 哈夫曼树 */
    huffmanTree: TreeNode | null = null;
    /** 编码后的二进制字符串 */
    bitString = '';

    compress(input: string, output?: string) {
        /** 如果文件不存在 */
        const fileStat = fs.statSync(input);
        const outputPath = output || input.replace(/\.\w+$/, '.zip');
        if (!fileStat.isFile())  {
            return console.error(`没有找到'${input}'文件`);
        }
        /**
         * 实现压缩
         * 接收字节流 --> 统计字符个数 --> 生成编码表 --> 压缩
        */
        readFile(input).then((buffer) => {
            const codingTable = this.init(buffer);
            /** 进行编码 */
            const compressedBuf = this.encode(buffer, codingTable);
            debugger;
            /** 输出文件，需要注意是：需要把编码表也存到文件中 */
            this.emitZipFile(compressedBuf, codingTable, outputPath);
        }).catch((err) => {
            console.error(`发生错误：${err}`);
        });
    }

    /** 解压 */
    decompress(input: string, output: string) {
        const fileStat = fs.statSync(input);
        if (!fileStat.isFile()) {
            return console.error(`没有找到'${input}'文件`);
        }
        /**
         * 实现解压：
         * 读取压缩文件流 --> 拿到编码 --> 生成解码表 --> 拿到数据流 --> 还原 
        */
        const readStream = fs.createReadStream(input);
        readStream.on('error', (err) => {
            console.error(`解压出现异常：${err}`);
        });

        const chunks: Buffer[] = [];
        let totalLength = 0;

        readStream.on('data', (chunk) => {
            const buffer = chunk as Buffer;
            chunks.push(buffer);
            totalLength += buffer.length;
        });

        readStream.on('end', () => {
            debugger;
            const buffer = Buffer.concat(chunks);   // 合并所有的 chunk
            /** 首先从前四位取出编码表的长度 */
            const encodingTableBufSize = buffer.readUint32BE(0);
            /** 再接取出编码表，subarray 等同于 slice，slice API 已弃用 */
            const endIdx = encodingTableBufSize + 4;
            const encodingTableBuf = buffer.subarray(4, endIdx);
            /** 然后取出编码字符串长度 */
            const bitSizeBuf = buffer.subarray(endIdx, endIdx + 4);
            /** 最后取出压缩数据 */
            const zipBinary = buffer.subarray(endIdx + 4);

            const codingTableJson = encodingTableBuf.toString();
            const bitLength = (bitSizeBuf as Buffer).readUint32BE(0);
            try {
                const decodingTable = this.createDecodingTable(JSON.parse(codingTableJson.toString()));

                // const obj = Array.from(decodingTable.entries()).reduce((acc, [k, v]) => {
                //     acc[k] = v;
                //     return acc;
                // }, {} as Record<string, number>);
                // fs.writeFileSync('./tmp-decodingTable.json', JSON.stringify(obj));

                debugger;
                const buffer = this.getOriginBuffer(decodingTable, zipBinary as Buffer, bitLength);
                debugger;
                this.emitOriginFile(buffer, output);
            } catch (error) {
                return console.error(`解压失败：${error}`);
            }
        });
    }

    public getByteStr = (num: number) => {
        const bit = num.toString(2);
        const { length } = bit;
        if (length === 8)   return bit;
        return new Array(8 - length).fill(0).join('').concat(bit);
    }

    /** 根据解码表和压缩后的数据生成原始数据 */
    public getOriginBuffer(decodingTable: Map<string, number>, buffer: Buffer, bitLength: number) {
        let binaryStr = '';
        const lastIdx = buffer.length - 1;
        /** 首先需要把 buffer 转成二进制字符串 */
        buffer.forEach((num, idx) => {
            const byte = this.getByteStr(num);
            if (idx !== lastIdx) {
                binaryStr += byte;
                // debugger;
            } else {        
                // 最后一位需要检查有没有向前填充 0，因为 bitLength 可能不是 8 的倍数
                /** 生成源文件的 buffer，需要注意的是：最后一个 byte 可能不是 8 位 */
                let lastByteStr = byte;
                const redundant = Math.abs(bitLength - binaryStr.length - lastByteStr.length);
                lastByteStr = lastByteStr.slice(redundant);
                binaryStr += lastByteStr;
            }
        });

        debugger;

        let bitStr = '';
        const nums: number[] = [];
        for (let i = 0, len = binaryStr.length; i < len; i ++) {
            bitStr += binaryStr[i];
            const value = decodingTable.get(bitStr);
            if (typeof value === 'number') {
                debugger;
                bitStr = '';
                nums.push(value);
            }
        }
        
        const finalBuf = Buffer.alloc(nums.length);
        debugger;
        finalBuf.set(nums);
        return finalBuf;
    }

    public emitOriginFile(buffer: Buffer, output: string) {
        writeFile(output, buffer).catch((error) => {
            console.error(`解压失败：${error}`);
        });
    }

    /** 根据编码表生成解码表 */
    public createDecodingTable(encodingTable: Record<string, string>) {
        const decodingTable = new Map<string, number>();
        Object.keys(encodingTable).forEach((byteStr) => {
            const binaryStr = encodingTable[byteStr];
            decodingTable.set(binaryStr, Number(byteStr));
        });
        return decodingTable;
    }

    private emitZipFile(compressedBuf: Buffer, codingTable: Map<number, string>, output: string) {
        /** 使用 stream 存储 */
        const writeStream = fs.createWriteStream(output, { encoding: 'binary' });
        writeStream.on('error', (err) => {
            console.error(`压缩出现异常：${err}`);
        });

        /** 把 map 转成 JSON */
        const json = this.mapToJson(codingTable);
        debugger;
        /** 在顶部用 32 位存储压缩表的大小 */
        const jsonBuf = Buffer.from(json);
        const jsonLenBuf = Buffer.alloc(4);
        jsonLenBuf.writeUint32BE(jsonBuf.length);
        debugger;
        writeStream.write(jsonLenBuf);
        writeStream.write(jsonBuf);
        /** 把字节长度写进去，申请一个 32 位长度的空间（4字节），最大表示数字：2^32 -1 */
        const bitSizeBuf = Buffer.alloc(4);
        bitSizeBuf.writeUInt32BE(this.bitString.length);
        debugger;
        writeStream.write(bitSizeBuf);
        writeStream.end(Buffer.from(compressedBuf));
    }

    private mapToJson <K extends number | string, V>(map: Map<K, V>) {
        const obj = {} as Record<K, V>;
        map.forEach((value, key) => {
            obj[key] = value;
        });
        return JSON.stringify(obj);
    }

    public init(buffer: Buffer) {
        /** 统计各个字节数的个数 */
        this.byteNumMap = this.statisticNum(buffer);
        /** 生成哈夫曼编码根据字节统计表 */
        this.huffmanTree = this.createHuffmanTree(this.byteNumMap);
        /** 生成编码表 */
        this.codingTable = this.getCodingTable(this.huffmanTree);
        return this.codingTable;
    }

    /** 统计个数（个数就是权值） */
    public statisticNum(buffer: Buffer) {
        const map = new Map<number, number>();
        buffer.forEach((byte) => {
            const count = map.get(byte) || 0;
            map.set(byte, count + 1);
        });
        return map;
    }

    /** 权值从大到小排序，取的时候用 pop 取（先取最小的） */
    public sort(nodeArray: TreeNode[]) {
        return nodeArray.sort((cur, next) => next.weight - cur.weight);
    }

    private _createHuffmanTree(nodeArr: TreeNode[]) {
        while(nodeArr.length > 1) {
            /** 先从小到大排序 */
            this.sort(nodeArr);
            /** 节点权值两两相加，生成父节点 */
            const node1 = nodeArr.pop() as TreeNode;
            const node2 = nodeArr.pop() as TreeNode;
            /** 父节点没有内容，只有权值 */
            const parentNode = new TreeNode(node1.weight + node2.weight);
            parentNode.left = node1;
            parentNode.right = node2;
            nodeArr.push(parentNode);
        }
        return nodeArr[0];
    }

    public createHuffmanTree(byteNumMap: Map<number, number>) {
        const nodeArray: TreeNode[] = [];
        for (let [byte, weight] of byteNumMap) {
            nodeArray.push(new TreeNode(weight, byte));
        }
        /** 开始生成哈夫曼树 */
        return this._createHuffmanTree(nodeArray);
    }

    private _getCodingTable(node: TreeNode | null, bit: '0' | '1' | '', strBuilder = '', table: Map<number, string>) {
        if (node) {
            /** 把传入的 code 拼接成字符串 */
            strBuilder += bit;
            /** 如果是非叶子节点（叶子节点都是有值的节点） */
            if (node.data === null) {
                this._getCodingTable(node.left, '0', strBuilder, table);
                this._getCodingTable(node.right, '1', strBuilder, table);
            } else {
                /** 当是叶子节点时，就把收集到的 strBuilder 放入 table 中 */
                table.set(node.data, strBuilder);
            }
        }
    }

    /** 生成编码表（key 是树节点的 value，value 是编码结果），根据哈夫曼树 */
    public getCodingTable(huffmanTree: TreeNode) {
        const map = new Map<number, string>();
        this._getCodingTable(huffmanTree.left, '0', "", map);
        this._getCodingTable(huffmanTree.right, '1', "", map);
        return map;
    }

    /** 编码 */
    public encode(buffer: Buffer, codingTable: Map<number, string>) {
        /** 1. 遍历原始的 buffer，从编码表里取出相应的码值，拼装成2进制字符串 */
        let binaryStr = '';
        buffer.forEach(byte => {
            binaryStr += codingTable.get(byte);
        });
        /** 2. 把 binaryStr 转成二进制流 */
        const binStrLen = binaryStr.length;
        /** 更新编码长度 */
        this.bitString = binaryStr;
        /** 计算出有多少个字节（1byte = 8bit） */
        const byteSize = Math.ceil(binStrLen / 8);
        const buf = Buffer.alloc(byteSize);
        /** 把生成的 binaryStr 每八位放入数组中 */
        let idx = 0;
        for (let i = 0; i < binStrLen; i += 8) {
            const byte = binaryStr.slice(i, i + 8);
            debugger;
            buf[idx] = Number(`0b${byte}`);
            idx += 1;
        }
        return buf;
    }
}

export default CompressFile;

const compressFile = new CompressFile();

compressFile.compress('./test/index.js');
// compressFile.decompress('./test/index.zip', './test/newIndex.js');

// compressFile.compress('./img/huffman-tree.png');
// compressFile.decompress('./img/huffman-tree.zip', './img/huffman-tree-new.png');

// compressFile.compress('./test/main.css');
// compressFile.decompress('./test/main.zip', './test/style.css');
