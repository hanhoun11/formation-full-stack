const express = require('express');
const app = express();
const fs = require('fs');
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');             
});

app.get('/api/products', (req, res) => {
const data = fs.readFileSync('./data/products.json');
const products = JSON.parse(data);
res.json(products);
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});