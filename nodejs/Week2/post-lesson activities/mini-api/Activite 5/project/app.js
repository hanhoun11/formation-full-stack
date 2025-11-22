// app.js
const express = require("express");
const app = express();
const productRoutes = require("./routes/products");
const errorHandler = require("./middlewares/errorHandler");

app.use(express.json());
app.use("/", productRoutes);

// Middleware d'erreur
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
