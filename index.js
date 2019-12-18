const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//website serving
app.use(express.static('static'));

//API

app.listen(port, () => console.log(`Listening on port: ${port}`));