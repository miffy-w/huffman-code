for (let i = 1; i < 10; i++) {
    let row = '';
    for (let j = 1; j <= i; j++) {
        row += `${i} * ${j} = ${i*j}\t`;
    }
    console.log(row);
}
