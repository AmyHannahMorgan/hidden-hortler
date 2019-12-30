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
const gameCode = getUrlQueries(window.location.search, 'code');

let myId;

let ws = new WebSocket(`ws://${window.location.host}`);

ws.onopen = () => {
    let msgObj = {
        type: 2,
        body: {
           code: gameCode
        }
    }

    console.log({msgObj});

    ws.send(JSON.stringify(msgObj));
};

ws.onmessage = (messsage) => {
    console.log(messsage)
    try {
        let msgJson = JSON.parse(messsage.data);
        console.log(msgJson);

        if(msgJson.type !== undefined) {

        }
        else if(msgJson.result !== undefined) {
            if(msgJson.result === 0) {
                switch (msgJson.body.type) {
                    case 2:
                        myId = msgJson.body.id;
                        break;
                
                    default:
                        break;
                }
            }
            else if(msgJson.result === 1) {
                console.log(msgJson.body.error);
            }
        }
        else {
            console.log(msgJson);
        }
    } catch (error) {
        console.log(error);
    }
}

for(let i = 0; i < playBoards.length; i++) {
    playBoardObjs.push(new PlayBoard(playBoards[i]));
}

function getUrlQueries(variables, name) {
    let params = new URLSearchParams(variables);
    return params.get(name);
}