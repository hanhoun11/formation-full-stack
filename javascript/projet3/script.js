
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");
const cancelBtn = document.getElementById("cancelBtn");
const historyList = document.getElementById("historyList");
const results = document.getElementById("results");

let history = [];
let controller = null;//servira pour AbortController pour annuler les requêtes HTTP.
const cache = new Map();//Map pour stocker les résultats des Pokémon déjà récupérés, pour ne pas refaire de fetch inutile.

// -------------------- Historique --------------------
function updateHistory() {   //reconstruit la liste HTML affichée (historyList) à partir du tableau history.
  historyList.innerHTML = "";  //vide la liste précédente.
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.addEventListener("click", () => searchPokemon(item));
    historyList.appendChild(li);
  });
}

function addToHistory(name) {
  if (!history.includes(name)) {
    history.unshift(name);
    if (history.length > 5) history.pop();
    updateHistory();
  }
}
//***fetchWithTimeout fait un fetch classique mais annule si la requête prend trop longtemps.
// setTimeout déclenche une erreur si le temps dépasse timeout (5000 ms par défaut).
// signal est utilisé par AbortController pour pouvoir annuler la requête.

// -------------------- Timeout et Retry --------------------
function fetchWithTimeout(url, { signal, timeout = 5000 } = {}) {    //encapsule fetch dans une promesse qui rejette si la requête prend plus de timeout
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), timeout);  //démarre un minuteur qui, arrivé à timeout, rejette la promesse avec une Error("Timeout").

    fetch(url, { signal }).then(res => {   //lance la requête fetch ; on passe le signal pour pouvoir annuler la requête depuis l'extérieur si nécessaire.
      clearTimeout(timer);                //Si fetch répond (.then(res)), on annule le timer (clearTimeout(timer)) puis on résout la promesse avec la réponse res.
      resolve(res);
    }).catch(err => {
      clearTimeout(timer);
      reject(err);                        //on annule le timer et on rejette avec l'erreur.
    });
  });
}
//retry permet de réessayer une fonction async plusieurs fois en cas d’erreur transitoire.
//backoffMs *= 2 → le temps d’attente double à chaque échec (exponentiel).

async function retry(fn, { retries = 3, backoffMs = 500 } = {}) {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch(err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, backoffMs));
      backoffMs *= 2;
    }
  }
}

// -------------------- Affichage --------------------
//Crée le HTML pour afficher le Pokémon : carte, image, nom, ID, types et stats.
// pokemon.color || '#ccc' → couleur de bordure si elle existe sinon gris par défaut.
// map → parcourt les types et stats pour les afficher correctement.
function displayPokemon(pokemon) {
  results.innerHTML = `
    <div class="pokemon-card" style="border-color:${pokemon.color || '#ccc'}">
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <div class="pokemon-name">${pokemon.name}</div>
      <div>ID: ${pokemon.id}</div>
      <div class="pokemon-types">
        ${pokemon.types.map(t => `<span>${t.type.name}</span>`).join('')}
      </div>
      <div>Stats: ${pokemon.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join(", ")}</div>
    </div>
  `;
}

// -------------------- Async/Await --------------------
//Vérifie si la recherche est vide
// Met en minuscules pour standardiser
// Si le Pokémon est en cache, on l’affiche directement et on met à jour l’historique
async function searchPokemon(query) {
  if (!query) return;
  query = query.toString().toLowerCase();

  if (cache.has(query)) {
    displayPokemon(cache.get(query));
    addToHistory(query);
    return;
  }
//Annule la requête précédente si elle existe
//Crée un nouveau AbortController pour cette requête
  if (controller) controller.abort();
  controller = new AbortController();
  const signal = controller.signal;

//Affiche « Chargement… »
// Promise.all → fetch parallèle du Pokémon et de sa species
// Vérifie le res.ok pour détecter si le Pokémon n’existe pas
// Combine les données et ajoute la couleur
// Stocke dans le cache, affiche et met à jour l’historique
  try {
    results.innerHTML = "<p>Chargement...</p>";
    const data = await retry(async () => {
      const [pokemonRes, speciesRes] = await Promise.all([
        fetchWithTimeout(`https://pokeapi.co/api/v2/pokemon/${query}`, { signal }),
        fetchWithTimeout(`https://pokeapi.co/api/v2/pokemon-species/${query}`, { signal })
      ]);

      if (!pokemonRes.ok || !speciesRes.ok) throw new Error("Pokémon introuvable");

      const pokemonData = await pokemonRes.json();
      const speciesData = await speciesRes.json();
      return { ...pokemonData, color: speciesData.color.name };
    }, { retries: 3, backoffMs: 500 });

    cache.set(query, data);
    displayPokemon(data);
    addToHistory(data.name);

  } catch(err) {
    //Gère les erreurs : annulation ou autre problème réseau/API
    if (err.name === "AbortError") results.innerHTML = "<p>Requête annulée</p>";
    else results.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

// -------------------- Callback et Promesse --------------------
//Simule un traitement async via setTimeout
//Permet de montrer le style callback avant d’utiliser Promise ou async/await
function fakeCallbackPipeline(query, cb) {
  setTimeout(() => {
    if (!query) return cb(new Error("Entrée vide"));
    query = query.toLowerCase();
    setTimeout(() => cb(null, query), 300);
  }, 300);
}
//Version Promise .then pour récupérer le Pokémon
// Gère l’erreur avec .catch et affiche le Pokémon avec displayPokemon
function fetchPokemonThenStyle(query) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`)
    .then(res => {
      if (!res.ok) throw new Error("Pokémon introuvable");
      return res.json();
    })
    .then(data => displayPokemon(data))
    .catch(err => results.innerHTML = `<p style="color:red">${err.message}</p>`);
}

// -------------------- Événements --------------------
//Search → recherche le Pokémon entré
// Enter → même chose quand on appuie sur Entrée
// Random → sélectionne un ID aléatoire de 1 à 1010 et cherche le Pokémon
// Cancel → vide l’input, efface les résultats et annule la requête en cours
searchBtn.addEventListener("click", () => searchPokemon(searchInput.value));
searchInput.addEventListener("keypress", e => { if (e.key === "Enter") searchPokemon(searchInput.value); });
randomBtn.addEventListener("click", () => {
  const randomId = Math.floor(Math.random() * 1010) + 1;
  searchPokemon(randomId);
});
cancelBtn.addEventListener("click", () => {
  searchInput.value = "";
  results.innerHTML = "";
  if (controller) controller.abort();
});