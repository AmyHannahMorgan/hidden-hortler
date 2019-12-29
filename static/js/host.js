const apiUrl = window.location.origin + '/api';
const wsUrl = `ws://${window.location.host}`;
const hostReq = new XMLHttpRequest();

let ws;

const gameCodeElement = document.querySelector('#gameCode');
let gameObject;

hostReq.addEventListener('load', (e) => {
    console.log(e);
    gameObject = JSON.parse(e.target.responseText);
    gameCodeElement.innerHTML = gameObject.gameCode;

    ws = new WebSocket(wsUrl);

    ws.addEventListener('message', (message) => {
        console.log(JSON.parse(message.data));
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

