const gen = require('./generators');
const express = require('express');
const webSocket = require('ws');
const app = express();
const port = process.env.PORT || 3000;
const games = [];

//website serving
app.use(express.static('static'));

//API
app.post('/api/host', (req, res) => {
    let hostIp = req.headers['x-forwarded-for'] !== undefined ? req.headers['x-forwarded-for'].split(',')[0] : req.ip;
    console.log(`Host game request recieved from: ${hostIp}`);
    let obj = gen.gameObject(games, hostIp);
    console.log(`Game created with the id: ${obj.gameId} \nand the code: ${obj.gameCode}`);
    games.push(obj);

    res.status(200).send(JSON.stringify(obj));

});

app.get('/api/play/:code([a-f0-9]{4})', (req, res) => {
    console.log(`Play request recieved with code ${req.params.code}`);
    
    if(checkGameCode(req.params.code)) {
        let obj = getGameObjectByCode(req.params.code);

        res.redirect(302, '/play/?id=' + obj.gameId);
    }
    else {
        res.status(404).send('Game with that code does not exist');
    }
});

app.get('/api/signaling/:id([a-f0-9]{12})', (req, res) => {

});

app.listen(port, () => console.log(`Listening on port: ${port}`));

//helper functions
function checkGameCode(code) {
    let flag = false;

    for(let i = 0; i < games.length; i++) {
        if(games[i].gameCode == code) {
            flag = true;
            break;
        }
    }

    return flag;
}

function getGameObjectByCode(code) {
    let obj;

    for(let i = 0; i < games.length; i++) {
        if(games[i].gameCode == code) {
            obj = games[i];
            break;
        }
    }

    return obj;
}