import fs from 'node:fs';

const writeStream = fs.createWriteStream('./test', {
    encoding: 'binary'
});

const num = 2003;

const buf = Buffer.alloc(4);

buf.writeUint32BE(num);

const buf2 = Buffer.from('你好');

console.log('buf2.length: ', buf2.length);

writeStream.write(buf);
writeStream.end(buf2);
