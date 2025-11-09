# Smart Inventory System

Ce projet est un serveur HTTP simple développé en Node.js pur (sans framework) pour servir des données statiques d'inventaire (produits et commandes) via une API RESTful.

## Prérequis

- [Node.js](https://nodejs.org/) (version 18.x ou supérieure)

## Installation

1.  Clonez ce dépôt sur votre machine locale.
2.  Naviguez dans le répertoire du projet :
    ```sh
    cd smartinventory
    ```
3.  Installez les dépendances (même s'il n'y en a pas, c'est une bonne pratique) :
    ```sh
    npm install
    ```
4.  Créez un fichier `.env` à la racine du projet en copiant le fichier `.env.sample`. Vous pouvez y modifier le port si nécessaire.

    ```sh
    cp .env.sample .env
    ```

## Démarrage

Pour lancer le serveur en mode développement (ou production), exécutez la commande suivante :

```sh
npm run dev
```

ou

```sh
npm start
```

Le serveur sera alors accessible à l'adresse `http://localhost:3000` (ou le port que vous avez configuré).

## Exemples d'Utilisation avec cURL

Voici quelques exemples de requêtes que vous pouvez effectuer avec `curl`.

### Point de terminaison de Santé

Vérifie l'état de fonctionnement du serveur.

```sh
curl "http://localhost:3000/health"
```

### API Produits

- **Lister tous les produits avec filtres et pagination :**
  ```sh
  curl "http://localhost:3000/api/products?category=tools&minPrice=10&maxPrice=100&page=1&limit=5"
  ```

- **Obtenir un produit par son ID :**
  ```sh

  curl "http://localhost:3000/api/products/1"
  ```

- **Obtenir un produit par son SKU :**
  ```sh
  curl "http://localhost:3000/api/products/sku/SKU-001"
  ```

### API Commandes

- **Lister les commandes avec filtres sur le statut et les dates :**
  ```sh
  curl "http://localhost:3000/api/orders?status=paid&from=2025-01-01&to=2025-12-31"
  ```

- **Obtenir une commande par son ID :**
  ```sh
  curl "http://localhost:3000/api/orders/101"
  ```

- **Obtenir une commande par son numéro de commande :**
  ```sh
  curl "http://localhost:3000/api/orders/number/ORD-2025-0001"
  ```