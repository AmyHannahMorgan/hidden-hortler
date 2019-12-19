const apiUrl = window.location.origin + '/api';
const hostReq = new XMLHttpRequest();

hostReq.addEventListener('load', (e) => {
    console.log(e);
});
hostReq.open('POST', apiUrl + '/host');
hostReq.send();
