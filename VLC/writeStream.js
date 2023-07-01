"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const writeStream = node_fs_1.default.createWriteStream('./test', {
    encoding: 'binary'
});
const num = 2003;
const buf = Buffer.alloc(4);
buf.writeUint32BE(num);
const buf2 = Buffer.from('你好');
console.log('buf2.length: ', buf2.length);
writeStream.write(buf);
writeStream.end(buf2);
