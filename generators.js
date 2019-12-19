function generateID() {
    let base10 = RNG(17592186044416, 281474976710655);
    return base10.toString(16)
}

function generateGameCode() {
    let base10 = RNG(4096, 65535);
    return base10.toString(16)
}

function genUnique(array, func) {
    let unique = false;
    let item = func();

    while(!unique) {
        let flag = true;

        for(let i = 0; i < array.length; i++) {
            if(item === array[i]) {
                flag = false;
            }
        }

        if(flag == true) {
            unique = true;
        }
        else {
            item = func();
        }
    }

    return item;

}

function RNG(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
    id: generateID,
    code: generateGameCode,
    unique: genUnique
};