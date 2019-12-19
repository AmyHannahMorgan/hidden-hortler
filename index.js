const gen = require('./generators');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const games = [];

//website serving
app.use(express.static('static'));

//API
app.post('/api/host', (req, res) => {
    console.log(req.connection.remoteAddress);
    console.log(req.ips);
    console.log(`Host game request recieved from: ${req.ip}`);
    let obj = gen.gameObject(games, req.ip);
    console.log(`Game created with the id: ${obj.gameId} \nand the code: ${obj.gameCode}`);
    games.push(obj);

    res.status(200).send(JSON.stringify(obj));

});

app.get(/\/api\/play\/\?code=[a-f0-9]{4}/, (req, res) => {

});

app.get(/\/api\/signaling\/\?id=[a-f0-9]{12}/, (req, res) => {

});

app.listen(port, () => console.log(`Listening on port: ${port}`));

//helper functions
