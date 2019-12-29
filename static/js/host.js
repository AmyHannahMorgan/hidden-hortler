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
        console.log(message);
    });

    ws.addEventListener('open', () => {
        let msgObj = {
            type: 0
        };
    
        ws.send(JSON.stringify(msgObj));
    })
});
hostReq.open('POST', apiUrl + '/host');
hostReq.send();

