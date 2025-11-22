// const mongoose = require('mongoose');
// // Connexion à MongoDB local
// mongoose.connect('mongodb://localhost:27017/demo_db')
// .then(() => console.log('Connecté à MongoDB'))
// .catch((err) => console.error('Erreur de connexion MongoDB', err));

const mongoose = require('mongoose');
// Définir un schéma
const bookSchema = new mongoose.Schema({
title: String,
author: String,
pages: Number,
});
// Créer un modèle basé sur ce schéma
const Book = mongoose.model('Book', bookSchema);
// Insérer un document
async function run() {
await mongoose.connect('mongodb://localhost:27017/demo_db');
const book = new Book({ title: '2004', author: 'Salma', pages: 100 });
await book.save();
console.log('Livre enregistré :', book);
}
run();