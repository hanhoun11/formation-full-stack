// services/dataService.js
const fs = require("fs").promises;
const path = require("path");

async function getProducts(filters = {}, sort = null) {
    const filePath = path.join(__dirname, "../data/products.json");
    const data = await fs.readFile(filePath, "utf-8"); // lecture asynchrone
    let products = JSON.parse(data);

    // Filtrage
    if (filters.category) {
        products = products.filter(p => p.category === filters.category);
    }
    if (filters.minPrice) {
        products = products.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
        products = products.filter(p => p.price <= Number(filters.maxPrice));
    }

    // Tri
    if (sort) {
        products.sort((a, b) => sort === "asc" ? a.price - b.price : b.price - a.price);
    }

    console.log(`Requête filtrée : ${JSON.stringify(filters)}, résultats : ${products.length}`);
    return products;
}

module.exports = { getProducts };
