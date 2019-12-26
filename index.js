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

const server = app.listen(port, () => console.log(`Listening on port: ${port}`));

const wss = new webSocket.Server({ server });

wss.on('connection', (ws, req) => {
    console.log(req);
    let obj = {
        type: 0,
        body: 'Please send the code related to your request'
    };

    ws.send(JSON.stringify(obj));

    ws.on('message', (msg) => handleWsMessage(ws, msg));
});

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

function checkGameId(id) {
    let flag = false

    for(let i = 0; i < games.length; i++) {
        if(games[i].gameId == id) {
            flag = true;
            break;
        }
    }

    return flag
}

function getGameObjectById(id) {
    let obj;

    for(let i = 0; i < games.length; i++) {
        if(games[i].gameId == id) {
            obj = games[i];
            break;
        }
    }

    return obj;
}

function handleWsMessage(ws, message) {
    try {
        let msgJSON = JSON.parse(message);

        switch (msgJSON.type) {
            case 0: //shouldnt be used, throw a fit
                
                break;
        
            case 1: //host connecting to websocket
                //setup host connection
                if(message.body.id !== undefined && checkGameId(message.body.id)) {
                    let obj = getGameObjectById(message.body.id);

                    if(obj.hostWebSocket == undefined) {
                        obj.hostWebSocket = ws;

                        ws.send('host successfully added to game');
                    }
                    else {
                        ws.send('host already connected to game');
                    }
                }
                else {
                    ws.send('invalid/no ID. please try again');
                }
                break;
            case 2: //player connecting to websocket
                //setup player id and signaling
                if(message.body.code !== undefined && checkGameCode(code)) {
                    let obj = getGameObjectByCode(message.body.code);
                    let player = 0;

                    obj.players.push(player);

                    ws.send();
                }
                break;
            case 3: //player sending message to host (caller to callee)

                break;
            case 4: //host replying to player (callee to caller)

                break;
            default:
                ws.send('unrecognised message type');
                break;
        }
    } 
    catch (error) {
        console.log(error);
        ws.send(`${error}`);
    }
}