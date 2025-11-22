const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Bienvenue sur mon premier serveur Express!');
});

app.get('/api/products', (req, res) => {
        res.json([{ id:1 , name: 'Lapotop' }, { id: 2, name: 'Phone' }]);
        });


app.get('/api/products/:id', (req, res) => {
        res.json({ message:` Produit ${req.params.id}` });
});                             

app.listen(3000, () => {
    console.log('Le serveur écoute sur http://localhost:3000');
});
        