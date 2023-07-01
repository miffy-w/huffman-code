"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const readStream = node_fs_1.default.createReadStream('./test');
const chunks = [];
readStream.on('data', (chunk) => {
    console.log('chunk ====>', chunk);
    chunks.push(chunk);
});
readStream.on('end', () => {
    const [numBuf, text] = chunks;
    const num = numBuf.readUint32BE();
    console.log('read result ----> ', num, text);
});
