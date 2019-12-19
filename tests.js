const index = require('./index');
const generators = require('./generators');
const tests = {
    genUnique: () => {
        let ar = [1, 3, 5, 6, 2, 9];
        let func = () => RNG(1, 10);
        let value = index.genUnique(ar, func);
        console.log({ar})
        console.log({value})
    }
}

function RNG(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min
}

tests.genUnique();