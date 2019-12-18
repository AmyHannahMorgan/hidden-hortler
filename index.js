const gen = require('./generators');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//website serving
app.use(express.static('static'));

//API
app.post('/api/host', (req, res) => {
    let obj = {
        gameId: '',
        gameCode: '',
        signallingEndpoint: ''
    };


});

app.get(/\/api\/play\/\?code=[a-f0-9]{4}/, (req, res) => {

});

app.get(/\/api\/signaling\/\?id=[a-f0-9]{12}/, (req, res) => {

});

app.listen(port, () => console.log(`Listening on port: ${port}`));