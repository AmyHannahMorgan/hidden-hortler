const playBoards = document.querySelectorAll('.playBoard');
const playBoardObjs = [];
const loadingScreen = document.querySelector('#loading');

for(let i = 0; i < playBoards.length; i++) {
    switch (playBoards[i].id) {
        case 'nameSelect':
            playBoardObjs.push(() => {
                console.log(playBoards[i]);
                return 1;
            });
            break;
        default:
            console.log('i got here');
            break;
    }
}