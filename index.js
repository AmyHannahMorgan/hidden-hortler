const gen = require('./generators');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const games = [];

//website serving
app.use(express.static('static'));

//API
app.post('/api/host', (req, res) => {
    games.push(gen.gameObject(games));
});

app.get(/\/api\/play\/\?code=[a-f0-9]{4}/, (req, res) => {

});

app.get(/\/api\/signaling\/\?id=[a-f0-9]{12}/, (req, res) => {

});

app.listen(port, () => console.log(`Listening on port: ${port}`));

//helper functions

module.exports = {
    genUnique: genUnique
};