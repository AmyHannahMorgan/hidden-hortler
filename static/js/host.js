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
                    let index = players.push(msgObj.body) - 1;
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
    let iconSrcs = [];

    for(let i = 0; i < nodeArray.length; i++) {
        iconSrcs.push(nodeArray[i].src);
    }

    return iconSrcs;
}

function spawnPlayerToken(player, playerHolder, iconArray) {
    let playerElem = document.createElement('div');
    playerElem.classList.add('player');

    let iconHolder = document.createElement('div');
    iconHolder.classList.add('iconHolder');

    for(let i = 0; i < iconArray.length; i++) {
        let icon = document.createElement('img');
        icon.src = iconArray[i];
        icon.classList.add('icon');
        iconHolder.appendChild(icon);
    }

    let playerName = document.createElement('p');
    playerName.classList.add('playerName');
    playerName.innerHTML = player.name;

    playerElem.appendChild(iconHolder);
    playerElem.appendChild(playerName);

    playerHolder.appendChild(playerName);
}