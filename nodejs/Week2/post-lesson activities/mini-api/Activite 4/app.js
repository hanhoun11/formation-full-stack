const express = require("express");
const app = express();
const routes = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");

app.use(express.json());
app.use("/", routes);

// Middleware d'erreur (toujours à la fin)
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));