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

        res.redirect(302, '/play/?code=' + obj.gameCode);
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
                let resObject = {
                    result: 0,
                    body: {
                        message: 'you shouldnt be using this message type but ok'
                    }
                };

                ws.send(JSON.stringify(resObject));
                break;
        
            case 1: //host connecting to websocket
                //setup host connection
                if(msgJSON.body.id !== undefined && checkGameId(msgJSON.body.id)) {
                    let obj = getGameObjectById(msgJSON.body.id);

                    if(obj.hostWebSocket == undefined) {
                        obj.hostWebSocket = ws;
                        let resObject = {
                            result: 0,
                            body: {
                                message: 'host successfully added to game'
                            }
                        }

                        ws.send(JSON.stringify(resObject));
                    }
                    else {
                        let resObject = {
                            result: 1,
                            body: {
                                message: 'host already connected to game'
                            }
                        }
                        ws.send(JSON.stringify(resObject));
                    }
                }
                else {
                    let resObject = {
                        result: 1,
                        body: {
                            message: 'invalid/no ID. please try again'
                        }
                    }
                    ws.send(JSON.stringify(resObject));
                }
                break;
            case 2: //player connecting to websocket
                //setup player id and signaling
                if(msgJSON.body.code !== undefined && checkGameCode(msgJSON.body.code)) {
                    let obj = getGameObjectByCode(msgJSON.body.code);
                    let player = gen.playerObject(obj.players, ws);
                    let resObject = {
                        result: 0,
                        respose: {
                            id: player.id
                        }
                    };

                    obj.players.push(player);

                    ws.send(JSON.stringify(resObject));
                }
                else {
                    let resObject = {
                        result: 1,
                        respose: {
                            error: 'there was no valid code with message'
                        }
                    }

                    ws.send(JSON.stringify(resObject));
                }
                break;
            case 3: //host to server and players, start game.
                if(msgJSON.body.id !== undefined && checkGameId(msgJSON)) {
                    let obj = getGameObjectById(msgJSON.body.id);

                    obj.started = true;

                    let resObject = {
                        result: 0,
                        body: {
                            message: 'game started successfully'
                        }
                    }
                }
                else {
                    let resObject = {
                        result: 1,
                        body: {
                            error: 'there was no valid ID provided'
                        }
                    };

                    ws.send(JSON.stringify(resObject));
                }
                break;
            case 4: //player sending message to host (caller to callee)

                break;
            case 5: //host replying to player (callee to caller)

                break;
            case 6: //player to host communication (placeholder)
                if(msgJSON.body.code !== undefined && checkGameCode(msgJSON.body.code)) {
                    let obj = getGameObjectByCode(msgJSON.body.code);

                    if(obj.hostWebSocket !== undefined) {
                        obj.hostWebSocket.send(message);
                    }
                    else {
                        let resObject = {
                            result: 1,
                            body: {
                                error: 'there is currently no host ws to send messages to'
                            }
                        }
                    }
                }
                else {
                    let resObject = {
                        result: 1,
                        respose: {
                            error: 'there was no valid code provided'
                        }
                    };

                    ws.send(JSON.stringify(resObject));
                }
                break;
            case 7: //host to all players communication (placeholder)
                if(msgJSON.body.id !== undefined && checkGameId(msgJSON.body.id)) {
                    let obj = getGameObjectById(msgJSON.body.id);

                    for(let i = o; i < obj.players.length; i++) {
                        players[i].webSocket.send(message);
                    }
                }
                else {
                    let resObject = {
                        result: 1,
                        body: {
                            error: 'no valid ID provided'
                        }
                    };

                    ws.send(JSON.stringify(resObject));
                }
                break;
            case 8: //host to specific player communication (placeholder)
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