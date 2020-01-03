class PlayBoard {
    constructor(element) {
        this.element = element;

        switch(element.id) {
            case 'nameSelect':
                    this.playButton = this.element.querySelector('#playButton');
                    this.nameBox = this.element.querySelector('#nameBox');
                    this.errorBox = this.element.querySelector('#nameErrorBox');

                    this.playButton.addEventListener('click', () => {
                        if(ws.readyState === 1) {
                            let myName = encodeURIComponent(this.nameBox.value.trim());
                            let hostMsg = {
                                type: 1,
                                body: {
                                    id: myId,
                                    name: myName
                                }
                            };

                            let wsMsg = {
                                type: 6,
                                body: {
                                    messsage: JSON.stringify(hostMsg)
                                }
                            }

                            console.log(ws.messsage);
                            console.log(JSON.stringify(wsMsg));
                            console.log(JSON.parse(JSON.stringify(wsMsg)));

                            ws.send(JSON.stringify(wsMsg));
                        }
                        else {
                            this.errorBox.innerHTML = 'There is currently no connection to the server, please try again later';
                        }
                    });
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
            switch (msgJson.type) {
                case 0: //system message

                    break;
                case 1: //join confirmation from host
                    
                    break;
                case 2: //game data and board switch

                    break;

                default:
                    break;
            }
        }
        else if(msgJson.result !== undefined) {
            if(msgJson.result === 0) {
                switch (msgJson.body.type) {
                    case 2: //id response from server
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