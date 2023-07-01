import fs from 'node:fs';

const readStream = fs.createReadStream('./test');

const chunks: (Buffer | string)[] = [];
readStream.on('data', (chunk) => {
    console.log('chunk ====>', chunk);
    chunks.push(chunk);
});

readStream.on('end', () => {
    const [numBuf, text] = chunks;
    const num = (numBuf as Buffer).readUint32BE();
    console.log('read result ----> ', num, text);
});
