class PlayBoardHandler {
    constructor(playBoardArray) {
        this.playBoards = playBoardArray;
        this.currentBoard = this.findActiveBoard();
        this.nextBoard = null;
    }

    changeBoard(boardName) {
        let board = this.findBoard(boardName);

        if(board !== null) {
            this.nextBoard = board;
            this.transitionBoard(this.currentBoard, true)
            .then(() => {
                this.transitionBoard(this.nextBoard, false)
            })
            .then(() => {
                this.currentBoard = this.nextBoard;
                this.nextBoard = null;
            });
        }
        else return false;
    }

    transitionBoard(playBoard, out) {
        return new Promise((res, rej) => {
            if(out) {
                playBoard.element.addEventListener('transitionend', function foo(e) {
                    playBoard.element.removeEventListener('transitionend', foo);
                    playBoard.element.classList.remove('active');
                    playBoard.element.classList.remove('fade-out');
                    res();
                });
                playBoard.element.classList.add('fade-out');
            }
            else if(!out) {
                playBoard.element.addEventListener('transitionend', function foo() {
                    playBoard.element.removeEventListener('transitionend', foo);
                    res();
                })
                playBoard.element.classList.add('active');
            }
        });
    }

    passData(boardName, data) {
        let destBoard = this.findBoard(boardName);

        if(destBoard !== null) return destBoard.passData(data);
        else return false;
    }

    findBoard(boardName) {
        let board = null;

        for(let i = 0; i < this.playBoards.length; i++) {
            if(boardName === this.playBoards[i].id) {
                board = this.playBoards[i];
                break;
            }
        }

        return board;
    }

    findActiveBoard() {
        let board = null;

        for(let i = 0; i < this.playBoards.length; i++) {
            if(this.playBoards[i].element.classList.contains('active')) {
                board = this.playBoards[i];
                break;
            }
        }

        return board;
    }
}

class PlayBoard {
    constructor(element) {
        this.element = element;
        this.id = element.id;

        switch(this.id) {
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

                        hostMsg = JSON.stringify(hostMsg);

                        let wsMsg = {
                            type: 6,
                            body: {
                                message: hostMsg,
                                code: gameCode
                            }
                        }

                        console.log(JSON.stringify(wsMsg));
                        console.log(JSON.parse(JSON.stringify(wsMsg)));

                        ws.send(JSON.stringify(wsMsg));
                    }
                    else {
                        this.errorBox.innerHTML = 'There is currently no connection to the server, please try again later';
                    }
                });
                break;
            case 'partyID':
                this.playerPartyDisplay = this.element.querySelector('#playerParty');
                this.whosHitler = this.element.querySelector('#hitler');
                this.comrades = this.element.querySelector('#comrades');
                this.checkButton = this.element.querySelector('.okCheck');

                this.passData = (data) => {
                    this.playerPartyDisplay.innerHTML = data.playerParty;
                    if(data.isHitler) this.whosHitler.innerHTML = 'You are Hitler';
                    else if(data.playerParty === 'fascist') {
                        let hitler = null
                        let pals = []
                        data.fashList.forEach(player => {
                            if(player.isHitler) {
                                hitler = player.name;
                            }
                            else if(player.name !== myName) pals.push(player);
                        });

                        this.whosHitler.innerHTML = `${hitler} is Hitler`;

                        if(pals.length > 0) {
                            this.comrades.innerHTML = pals.length === 2 ? `Your comrades are ${pals[0].name} and ${pals[1].name}` : `Your comrade is ${pals[0].name}`;
                        }
                    }
                }

                this.checkButton.addEventListener('click', () => {
                    playBoardHandler.changeBoard('waiting');
                    let hostMsg = {
                        type: 2,
                        body: {
                            type: 0,
                            id: myId,
                            value: true
                        }
                    }

                    hostMsg = JSON.stringify(hostMsg);

                    let wsMsg = {
                        type: 6,
                        body: {
                            code: gameCode,
                            message: hostMsg
                        }
                    }

                    ws.send(JSON.stringify(wsMsg))
                });
                break;
            case 'selectChancellor':
                this.playerIconTemplate = this.element.querySelector('.playerIcon');
                this.confirmModal = this.element.querySelector('.confirmModal');
                this.yesCheck = this.confirmModal.querySelector('.yesCheck');
                this.noCheck = this.confirmModal.querySelector('.noCheck');

                this.passData = (data) => {
                    data.players.forEach(player => {
                        let playerIcon = this.playerIconTemplate.cloneNode(true);
                        playerIcon.classList.remove('template');
                        playerIcon.setAttribute('player-id', player.id);
                        playerIcon.setAttribute('player-name', player.name);
                        playerIcon.querySelector('.playerName').innerHTML = player.name;

                        playerIcon.addEventListener('click', (e) => {
                            this.confirmModal.classList.add('active');
                            this.confirmModal.querySelector('.selectedPlayer').innerHTML = e.target.getAttribute('player-name');
                            this.confirmModal.setAttribute('player-id', e.targetgetAttribute('player-id'));
                        });

                        this.element.appendChild(playerIcon);
                    });
                }
                this.yesCheck.addEventListener('click', () => {
                    let hostMsg = {
                        type: 1,
                        body: {
                            selectedPlayerID: this.confirmModal.getAttribute('player-id')
                        }
                    };

                    hostMsg = JSON.stringify(hostMsg);

                    let wsMsg = {
                        type: 6,
                        body: {
                            code: gameCode,
                            message: hostMsg
                        }
                    }

                    ws.send(JSON.stringify(wsMsg));
                });

                this.noCheck.addEventListener('click', () => {
                    this.confirmModal.classList.remove('active');
                })
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
let myName;

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
                    myName = msgJson.body.name;
                    playBoardHandler.changeBoard('waiting');
                    break;
                case 2: //game data and board switch
                    if(msgJson.body.data !== null) {
                        playBoardHandler.passData(msgJson.body.data.destination, msgJson.body.data);
                    }

                    if(msgJson.body.switch !== '') {
                        playBoardHandler.changeBoard(msgJson.body.switch);
                    }
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
const playBoardHandler = new PlayBoardHandler(playBoardObjs);

function getUrlQueries(variables, name) {
    let params = new URLSearchParams(variables);
    return params.get(name);
}