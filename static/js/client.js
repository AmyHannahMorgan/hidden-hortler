class PlayBoard {
    constructor(element) {
        this.element = element;

        switch(element.id) {
            case 'nameSelect':
                break;
            default:
                console.log(`unrecognised id: ${element.id}`);
                break;
        }
    }
}

const playBoards = document.querySelectorAll('.playBoard');
const playBoardObjs = [];
const loadingScreen = document.querySelector('#loading');

for(let i = 0; i < playBoards.length; i++) {
    playBoardObjs.push(new PlayBoard(playBoards[i]));
}