const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Bienvenue sur mon premier serveur Express!');
});

app.listen(3000, () => {
    console.log('Le serveur écoute sur http://localhost:3000');
});
