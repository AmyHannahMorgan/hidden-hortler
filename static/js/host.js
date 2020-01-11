const apiUrl = window.location.origin + '/api';
const wsUrl = `ws://${window.location.host}`;
const hostReq = new XMLHttpRequest();

let ws;

const gameCodeElement = document.querySelector('#gameCode');
let gameObject;

const startGameButton = document.querySelector('#gameStart');

const playerContainer = document.querySelector('.playerArea');
const playerIcons = buildPlayerIcons(playerContainer.querySelectorAll('.icon'));
const players = [];
let enoughPlayers = false;
let maxPlayers = false;

hostReq.addEventListener('load', (e) => {
    console.log(e);
    gameObject = JSON.parse(e.target.responseText);
    gameCodeElement.innerHTML = gameObject.gameCode;

    ws = new WebSocket(wsUrl);

    ws.addEventListener('message', (message) => {
        let msgObj = JSON.parse(message.data); 
        
        if(msgObj.result !== undefined) {
            console.log(msgObj);
        }
        else if(msgObj.type !== undefined) {
            //switch case goes here
            switch (msgObj.type) {
                case 0: // system message

                    break;
                case 1: // player join message with name
                    console.log(`Player ${msgObj.body.name} joined with the ID: ${msgObj.body.id}`)
                    let index = players.push(msgObj.body) - 1;
                    spawnPlayerToken(players[index], playerContainer, playerIcons);

                    let playerMsg = {
                        type: 1,
                        body: {
                            message: 'welcome to the game'
                        }
                    };

                    playerMsg = JSON.stringify(playerMsg);
                    
                    let wsMsg = {
                        type: 8,
                        body: {
                            id: gameObject.gameId,
                            playerId: players[index].id,
                            message: playerMsg
                        }
                    }

                    ws.send(JSON.stringify(wsMsg));
                    break;
                case 2: // game data from players

                    break;
            
                default:
                    break;
            }
        }
    });

    ws.addEventListener('open', () => {
        let msgObj = {
            type: 1,
            body: {
                id: gameObject.gameId
            }
        };
    
        ws.send(JSON.stringify(msgObj));
    })
});
hostReq.open('POST', apiUrl + '/host');
hostReq.send();

startGameButton.addEventListener('click', () => {
    if(ws !== undefined && ws.readyState == 1) {
        let msgObj = {
            type: 3,
            body: {
                id: gameObject.gameId
            }
        };

        ws.send(JSON.stringify(msgObj));
    }
})

function buildPlayerIcons(nodeArray) {
    let icons = [];

    for(let i = 0; i < nodeArray.length; i++) {
        let iconElem = document.createElement('img');
        iconElem.src = nodeArray[i].src;
        iconElem.classList = nodeArray[i].classList;
        icons.push(iconElem);
    }

    return icons;
}

function spawnPlayerToken(player, playerHolder, iconArray) {
    let playerElem = document.createElement('div');
    playerElem.classList.add('player');

    let iconHolder = document.createElement('div');
    iconHolder.classList.add('iconHolder');

    for(let i = 0; i < iconArray.length; i++) {
        iconHolder.appendChild(iconArray[i].cloneNode(true));
        console.log(iconHolder);
    }

    let playerName = document.createElement('p');
    playerName.classList.add('playerName');
    playerName.innerHTML = player.name;

    playerElem.appendChild(iconHolder);
    playerElem.appendChild(playerName);

    playerHolder.appendChild(playerElem);
}

function checkPlayers(){
    if(players.length > 4 && players.length < 10) {
        enoughPlayers = true
        switch (players.length) {
            case 5:
                
                break;

            case 7:

                break;

            case 9:

                break;
        
            default:
                break;
        }
    }
    else if(players.length === 10) {
        maxPlayers = true
    }
}