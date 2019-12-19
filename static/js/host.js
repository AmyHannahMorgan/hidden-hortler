const apiUrl = window.location.origin + '/api';
const hostReq = new XMLHttpRequest();

const gameCodeElement = document.querySelector('#gameCode');
let gameObject;

hostReq.addEventListener('load', (e) => {
    console.log(e);
    gameObject = JSON.parse(e.target.responseText);
    gameCodeElement.innerHTML = gameObject.gameCode;
});
hostReq.open('POST', apiUrl + '/host');
hostReq.send();

