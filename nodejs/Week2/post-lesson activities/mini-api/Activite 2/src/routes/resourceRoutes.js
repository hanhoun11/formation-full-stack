const express = require("express");
const router = express.Router();

// -------------------- Données en mémoire --------------------
let resources = [
  { id: 1, name: "Ressource 1", description: "Première ressource" },
  { id: 2, name: "Ressource 2", description: "Deuxième ressource" },
];

// -------------------- Middleware de validation --------------------
function validateResource(req, res, next) {
  const { name, description } = req.body;
  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Les champs 'name' et 'description' sont obligatoires" });
  }
  next();
}

// GET → toutes les ressources
router.get("/", (req, res) => {
  res.json(resources);
});

// GET → une ressource par id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const resource = resources.find((r) => r.id === id);

  if (!resource) {
    return res.status(404).json({ message: "Ressource non trouvée" });
  }

  res.json(resource);
});

// POST → créer une ressource
router.post("/", validateResource, (req, res) => {
  const newResource = {
    id: resources.length + 1,
    name: req.body.name,
    description: req.body.description,
  };

  resources.push(newResource);
  res.status(201).json(newResource); // 201 = créé
});

// PUT → modifier une ressource
router.put("/:id", validateResource, (req, res) => {
  const id = parseInt(req.params.id);
  const resource = resources.find((r) => r.id === id);

  if (!resource) {
    return res.status(404).json({ message: "Ressource non trouvée" });
  }

  resource.name = req.body.name;
  resource.description = req.body.description;

  res.json(resource);
});

// DELETE → supprimer une ressource
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  resources = resources.filter((r) => r.id !== id);

  res.status(204).send(); // 204 = supprimé sans contenu
});

module.exports = router;
