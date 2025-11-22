const express = require("express");
const router = express.Router();
const AppError = require("../utils/AppError");

router.get("/users/:id", (req, res, next) => {
    const userId = req.params.id;
    const user = null; // simulons que l'utilisateur n'existe pas

    if (!user) {
        // On crée et envoie l'erreur à Express
        return next(new AppError("Resource not found", 404));
    }

    res.json(user);
});

module.exports = router;