//HACK: this entire thing is using websockets, want to use webRTC, maybe write worker to make a uniform system for sending and reciving data regardless of the connecton type used
//TODO: use session storage to store data such as game codes and playerIDs to allow for reconnection in the event of a disconnect

class PlayerCheck {
    constructor(playerList, type, callback) {
        this.type = type;
        this.callback = callback;
        this.responses = [];

        switch(type) {
            case 'check':
                playerList.forEach(player => {
                    let obj = {
                        id: player.id,
                        response: false
                    };

                    this.responses.push(obj);
                });
                break;
            case 'vote':
                playerList.forEach(player => {
                    let obj = {
                        id: player.id,
                        response: null
                    };

                    this.responses.push(obj);
                });
                break;
        }
    }

    get check() {
        let flag = true;

        switch(this.type) {
            case 'check':
                this.responses.forEach(response => {
                    if(!response.response) {
                        flag = false;
                    }
                });
                break;
            case 'vote':
                this.responses.forEach(response => {
                    if(response.response === null) {
                        flag = false;
                    }
                });
                break;
        }

        return flag;
    }

    update(id, value) {
        let response = this.findResByID(id)

        response.response = value;

        if(this.check) {
            if(this.type === 'vote') {
                let yes = 0;
                let no = 0;

                this.responses.forEach(response => {
                    if(response.value) yes++;
                    else no++;
                });

                this.callback([yes, no]);
            }
            else this.callback();
        }
    }

    findResByID(id) {
        let found = null
        this.responses.forEach(response => {
            if(response.id === id) found = response;
        });
        return found;
    }
}

class PolicyDeck {
    constructor() {
        this.deck = [];
        this.discardPile = [];

        for(let i = 0; i < 11; i++) {
            let card = {
                type: 'fascist'
            }

            this.deck.push(card);

            if(i < 6) {
                card = {
                    type: 'liberal'
                }

                this.deck.push(card);
            }
        }

        this.shuffle();
    }

    shuffle() {
        let newDeck = [];

        for(let i = 0; i < 17; i++) {
            newDeck.push(this.deck.splice(RNG[0, this.deck.length - 1], 1)[0]);
        }

        this.deck = newDeck;
    }

    draw(number) {
        //TODO: recombine and shuffle deck on overdraw
        return this.deck.splice(0, number);
    }

    recombine() {
        this.deck = this.deck.concat(this.discardPile);
        this.discardPile = [];
    }

    discard(cards) {
        if(Array.isArray(cards)) {
            this.discardPile = this.discardPile.concat(cards);
        }
        else this.discardPile.push(cards);
    }

}
const apiUrl = window.location.origin + '/api';
const wsUrl = `ws://${window.location.host}`;
const hostReq = new XMLHttpRequest();

let ws;

const gameCodeElement = document.querySelector('#gameCode');
let gameObject;

const startupHolder = document.querySelector('#startup');
const boardHolder = document.querySelector('#boards');
const endHolder = document.querySelector('#end');

const startGameButton = document.querySelector('#gameStart');

const playerContainer = document.querySelector('.playerArea');
const playerIcons = buildPlayerIcons(playerContainer.querySelectorAll('.icon'));
const players = [];
let enoughPlayers = false;
let maxPlayers = false;

let currentCheck = null;

hostReq.addEventListener('load', (e) => {
    console.log(e);
    gameObject = JSON.parse(e.target.responseText);
    gameCodeElement.innerHTML = gameObject.gameCode;

    ws = new WebSocket(wsUrl);

    ws.addEventListener('message', (message) => {
        let msgObj = JSON.parse(message.data); 
        
        if(msgObj.result !== undefined) {
            console.log(msgObj);
            if(msgObj.result === 0) {
                switch(msgObj.body.type) {
                    case 3:
                        startGame();
                }
            }
        }
        else if(msgObj.type !== undefined) {
            //switch case goes here
            switch (msgObj.type) {
                case 0: // system message

                    break;
                case 1: // player join message with name
                    if(!maxPlayers){
                        //TODO: add check to avoid duplicate names
                        console.log(`Player ${msgObj.body.name} joined with the ID: ${msgObj.body.id}`)
                        let index = players.push(msgObj.body) - 1;
                        spawnPlayerToken(players[index], playerContainer, playerIcons, index);
    
                        let playerMsg = {
                            type: 1,
                            body: {
                                message: 'welcome to the game',
                                name: msgObj.body.name
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
                        checkPlayers();
                    }
                    break;
                case 2: // game data from players
                    switch(msgObj.body.type) {
                        case 0: //check data
                            currentCheck.update(msgObj.body.id, msgObj.body.value);
                            break;
                        case 1: // chancellor select
                            gameObject.chancellor = findPlayerByID(msgObj.body.selectedPlayerID);

                            currentCheck = new PlayerCheck(players, 'vote', result => {
                                if(result[0] > result[1]) {
                                    gameObject.hungParlimentCounter = 0;
                                    gameObject.lastPresident = gameObject.president
                                    gameObject.lastChancellor = gameObject.chancellor
                                    let cards = gameObject.deck.draw(3);

                                    let playerMsg = {
                                        type: 2,
                                        body: {
                                            switch: 'presidentPolicy',
                                            data: {
                                                destination: 'presidentPolicy',
                                                type: 'president',
                                                policies: cards
                                            }
                                        }
                                    }

                                    playerMsg = JSON.stringify(playerMsg);

                                    let wsMsg = {
                                        type: 8,
                                        body: {
                                            id: gameObject.id,
                                            playerId: gameObject.president.id,
                                            message: playerMsg
                                        }
                                    }

                                    ws.send(JSON.stringify(wsMsg));
                                }
                                else if(checkHungParliment()) {
                                    gameObject.hungParlimentCounter = 0;
                                    //TODO: play top policy
                                    //TODO: select next president
                                }
                                else {
                                    gameObject.hungParlimentCounter += 1;
                                    //TODO: select next president
                                }
                            });

                            let playerMsg = {
                                type: 2,
                                body: {
                                    switch: 'chancellorVote',
                                    data: {
                                        destination: 'chancellorVote',
                                        president: gameObject.president,
                                        chancellor: gameObject.chancellor
                                    }
                                }
                            }

                            let wsMsg = {
                                type: 7,
                                body: {
                                    id: gameObject.gameId,
                                    message: playerMsg
                                }
                            }

                            ws.send(JSON.stringify(wsMsg));
                            break;
                        case 2:
                            gameObject.deck.discard(msgObj.body.discard);
                            let playerMsg = {
                                type: 2,
                                body: {
                                    switch: 'chancellorPolicy',
                                    data: {
                                        destination: 'chancellorPolicy',
                                        type: 'chancellor',
                                        policies: msgObj.body.remainder
                                    }
                                }
                            }

                            playerMsg = JSON.stringify(playerMsg);

                            let wsMsg = {
                                type: 8,
                                body: {
                                    id: gameObject.id,
                                    playerId: gameObject.chancellor.id,
                                    message: playerMsg
                                }
                            }

                            ws.send(JSON.stringify(wsMsg));
                            break;
                        case 3:
                            gameObject.deck.discard(msgObj.body.remainder);
                            playPolicy(msgObj.body.selected);
                            break;
                        //TODO: case 4: card peek
                        //TODO: case 5: player select (president, investigate, shoot)
                    }
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
if(startupHolder.classList.contains('active')) {
    hostReq.open('POST', apiUrl + '/host');
    hostReq.send();
}

startGameButton.addEventListener('click', () => {
    if(ws !== undefined && ws.readyState == 1 && enoughPlayers) {
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

function spawnPlayerToken(player, playerHolder, iconArray, index) {
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
    playerName.innerHTML = player.name; //TODO: decode text, set as innerText rather than innerHTML

    playerElem.appendChild(iconHolder);
    playerElem.appendChild(playerName);
    
    playerElem.setAttribute('player-index', index);

    playerHolder.appendChild(playerElem);
}

function checkPlayers(){
    if(players.length > 4 && players.length < 10) {
        if(!enoughPlayers) enoughPlayers = true;

        switch (players.length) {
            case 5:
                gameObject.counters = buildCounters(5);
                break;
            case 7:
                boardHolder.classList.remove('min5');
                boardHolder.classList.add('min7');
                gameObject.counters = buildCounters(7);
                break;

            case 9:
                boardHolder.classList.remove('min7');
                boardHolder.classList.add('min9');
                gameObject.counters = buildCounters(9);
                break;
        
            default:
                break;
        }
    }
    else if(players.length === 10) {
        maxPlayers = true
    }
}

function buildCounters(playerNumber) {
    let obj = {
        fash: [],
        lib: []
    };
    
    for(let i = 0; i < 6; i++) {
        let fashCounter = {
            type: 'none',
            active: false
        };

        switch (playerNumber) {
            case 5:
                if(i === 2) {
                    fashCounter.type = 'peek'
                }
                break;
            case 7:
                if(i === 1) {
                    fashCounter.type = 'check';
                }
                else if(i === 2) {
                    fashCounter.type = 'pick';
                }
                break;
            case 9:
                if(i === 0 || i === 1) {
                    fashCounter.type = 'check';
                }
                else if(i === 2) {
                    fashCounter.type = 'pick';
                }
                break;
        
            default:
                break;
        }
        if(i === 3 || i === 4) {
            fashCounter.type = 'kill';
        }

        obj.fash.push(fashCounter);
    }

    for(let i = 0; i < 5; i++) {
        let libCounter = {
            active: false
        };

        obj.lib.push(libCounter);
    }

    return obj;
}

function playPolicy(policyCard) {
    switch(policyCard.type) {
        case 'fascist':
            gameObject.counters.fash.forEach((counter, index) => {
                if(!counter.active) {
                    counter.active = true;
                    boardHolder.querySelector('.fashArea').querySelectorAll('.boardCounter')[index].classList.add('active');
                    //TODO: handle special counters
                    break;
                }
            });
            if(boardHolder.querySelector('.fashArea').querySelectorAll('.boardCounter.active').length === 6) {
                //handle facist win
            }
            break;
        case 'liberal':
            gameObject.counters.lib.forEach((counter, index) => {
                if(!counter.active) {
                    counter.active = true;
                    boardHolder.querySelector('.libArea').querySelectorAll('.boardCounter')[index].classList.active('active');
                }
            });
            if(boardHolder.querySelector('.libArea').querySelectorAll('.boardCounter.active').length === 5) {
                //handle liberal win
            }
            break;
    }
}

function handleWin(type, reasonMessage) {
    if(type) {
        endHolder.querySelector('#endMessage').innerText = 'Fascists have won!';
        endHolder.querySelector('#endReason').innerText = reasonMessage;
    }
    else {
        endHolder.querySelector('#endMessage').innerText = 'Liberals have won!';
        endHolder.querySelector('#endReason').innerText = reasonMessage;
    }

    
    boardHolder.classList.remove('active');
    endHolder.classList.add('active');
    let playerIcons = playerContainer.querySelector('.player');

    for(let i = 0; i < playerIcons.length; i++) {
        let player = players[parseInt(playerIcons[i].getAttribute('player-index'))];
        if(player.party = 'fascist') {
            if(player.isHitler) playerIcons[i].classList.add('hitler');
            else playerIcons[i].classList.add('fascist');
        }
        else if(player.party === 'liberal') playerIcons[i].classList.add('liberal');
    }
}

function startGame() {
    startupHolder.classList.remove('active');
    boardHolder.classList.add('active');
    gameObject.deck = new PolicyDeck();

    let undefinedPlayers = [...players];
    let fash = [];
    let libs = [];
    switch(players.length) {
        case 5:
        case 6:
            for(let i = 0; i < players.length; i++) {
                let pick = RNG(0, undefinedPlayers.length - 1);
                let player = undefinedPlayers.splice(pick, 1)[0];
                player.isHitler = false;

                if(i < 2) {
                    player.party = 'fascist';
                    fash.push(player);
                }
                else {
                    player.party = 'liberal';
                    libs.push(player);
                }
            }
            break;
        case 7:
        case 8:
            for(let i = 0; i < players.length; i++) {
                let pick = RNG(0, undefinedPlayers.length - 1);
                let player = undefinedPlayers.splice(pick, 1)[0];
                player.isHitler = false;

                if(i < 3) {
                    player.party = 'fascist';
                    fash.push(player);
                }
                else {
                    player.party = 'liberal';
                    libs.push(player);
                }
            }
            break;
        case 9:
        case 10:
            for(let i = 0; i < players.length; i++) {
                let pick = RNG(0, undefinedPlayers.length);
                let player = undefinedPlayers.splice(pick, 1)[0];
                player.isHitler = false;

                if(i < 4) {
                    player.party = 'fascist';
                    fash.push(player);
                }
                else {
                    player.party = 'liberal';
                    libs.push(player);
                }
            }
            break;
    }
    fash[RNG(0, fash.length - 1)].isHitler = true;

    for(let i = 0; i < players.length; i++) {
        let playerMsg

        if(players[i].party === 'liberal' || players[i].isHitler) {
            playerMsg = {
                type: 2,
                body: {
                    switch: 'partyID',
                    data: {
                        destination: 'partyID',
                        playerParty: players[i].party,
                        isHitler: players[i].isHitler
                    }
                }
            }
        }
        else if (players[i].party = 'fascist') {
            playerMsg = {
                type: 2,
                body: {
                    switch: 'partyID',
                    data: {
                        destination: 'partyID',
                        playerParty: players[i].party,
                        isHitler: players[i].isHitler,
                        fashList: fash
                    }
                }
            }
        }

        playerMsg = JSON.stringify(playerMsg);

        let wsMsg = {
            type: 8,
            body: {
                id: gameObject.gameId,
                playerId: players[i].id,
                message: playerMsg
            }
        }

        ws.send(JSON.stringify(wsMsg));
    }

    currentCheck = new PlayerCheck(players, 'check', () => {
        pickPresident();
    });
}

function pickPresident() {
    if(gameObject.president === null) {
        gameObject.presidentIndex = RNG(0, players.length - 1);
        gameObject.president = players[gameObject.presidentIndex];
    }
    else {
        if(gameObject.presidentIndex === players.length - 1) {
            gameObject.presidentIndex = 0;
            gameObject.president = players[gameObject.presidentIndex];
        }
        else {
            gameObject.presidentIndex += 1;
            gameObject.president = players[gameObject.presidentIndex];
        }
    }

    let playerMsg = {
        type: 2,
        body: {
            switch: 'selectChancellor',
            data: {
                destination: 'selectChancellor',
                players: players
            }
        }
    }

    playerMsg = JSON.stringify(playerMsg);

    let wsMsg = {
        type: 8,
        body: {
            id: gameObject.gameId,
            playerId: gameObject.president.id,
            message: playerMsg
        }
    }

    ws.send(JSON.stringify(wsMsg));
}

function findPlayerByID(id, playerList) {
    playerList.forEach(player => {
        if(player.id === id) return player;
    });

    return null;
}

function checkHungParliment() {
    if(gameObject.hungParlimentCounter === 3) return true;
    else return false;
}

function RNG(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min
}