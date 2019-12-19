const gen = require('./generators');
const express = require('express');
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

app.get(/\/api\/play\/\?code=[a-f0-9]{4}/, (req, res) => {

});

app.get(/\/api\/signaling\/\?id=[a-f0-9]{12}/, (req, res) => {

});

app.listen(port, () => console.log(`Listening on port: ${port}`));

//helper functions
