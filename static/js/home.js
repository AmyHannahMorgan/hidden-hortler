const apiUrl = window.location.origin + '/api';

const playButton = document.querySelector('#play');
const playModal = document.querySelector('#playModal');
const playModalClose = playModal.querySelector('.closeContainer');
const playModalInput = playModal.querySelector('#gameCodeInput');
const playModalJoin = playModal.querySelector('#joinButton');
const playModalError = playModal.querySelector('#errorText');

const hostButton = document.querySelector('#host');

playButton.addEventListener('click', () => {
    playModal.classList.add('active');
});

playModalClose.addEventListener('click', () => {
    playModal.classList.remove('active');
});

playModalJoin.addEventListener('click', () => {
    if(checkCodeInput(playModalInput.value)) {
        let req = new XMLHttpRequest()
        req.addEventListener('load', (e) => {
            console.log(e);
            switch(e.target.status) {
                case 404:
                    playModalError.innerHTML = e.target.responseText;
                    break;
                case 200:
                case 302:
                    window.location.href = e.target.responseURL;
                    break;
            }
        });

        req.open('GET', apiUrl + '/play/' + playModalInput.value.trim());
        req.send();
    }
    else {
        playModalError.innerHTML = 'Game code is invalid. <br> Reminder: codes are case sensitive'
    }
});

function checkCodeInput(string) {
    string = string.trim();
    let check = string.match(/^[a-f0-9]{4}$/);

    if(check !== null) {
        return true;
    }
    else {
        return false;
    }
}

hostButton.addEventListener('click', () => {
    window.location.href = window.location.origin + '/host';
})

