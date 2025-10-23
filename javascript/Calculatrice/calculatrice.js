document.addEventListener("DOMContentLoaded", () => { //attend que le DOM (la page HTML) soit entièrement chargé avant d’exécuter notre code JS
  console.log("calculatrice.js : script chargé");

  // ---------- Sélections DOM ----------
  const displayEl = document.getElementById("display");   //récupère la <div id="display"> (l'écran de la calculatrice) et la stocke dans displayEl.
  const keysEl = document.getElementById("keys");   // récupère le conteneur de boutons (<div id="keys">) pour écouter les clics par délégation.
  const historyEl = document.getElementById("history");
  const wrapper = document.getElementById("wrapper"); 

  if (!displayEl || !keysEl) {
    console.error("Elements #display ou #keys introuvables. Vérifie ton HTML.");
    return;
  }

  // ---------- État ----------
  let state = {
    current: "0",   //chaîne affichée actuellement
    previous: null,  //valeur précédente
    operator: null,  //opérateur en attente
    overwrite: false,  //indique si on doit remplacer ou ajouter des chiffres.
    history: []
  };

  // ---------- Formatage & calcul "sûr" ----------
  function formatNumber(value) {      
    if (value === "Error") return "Error";                          //si la valeur indique une erreur, renvoyer "Error"
    const num = Number(value);
    if (Number.isNaN(num) || !isFinite(num)) return "Error";
    const n = Object.is(num, -0) ? 0 : num; 

    // Choisir la meilleure représentation
    let s;
    // cas extrêmes -> exposant
    if (Math.abs(n) !== 0 && (Math.abs(n) < 1e-6 || Math.abs(n) >= 1e12)) {
      s = n.toExponential(6);
    } else {
      s = Number(n.toPrecision(12)).toString();
    }
    // si encore trop long, forcer exposant
    if (s.length > 12 && !s.includes("e")) s = n.toExponential(6);
    return s;
  }

  function safeCompute(a, b, op) {
    if (!isFinite(a) || !isFinite(b)) return "Error";
    let res;
    switch (op) {
      case "+": res = a + b; break;
      case "-": res = a - b; break;
      case "×": res = a * b; break;
      case "÷":
        if (b === 0) return "Error";
        res = a / b; break;
      default: return "Error";
    }
    // arrondir pour éviter erreurs flottantes
    res = Number(res.toFixed(12));
    if (!isFinite(res) || Number.isNaN(res)) return "Error";
    return res;
  }

  // ---------- Affichage & historique ----------
  function updateDisplay() {
    displayEl.textContent = formatNumber(state.current);
  }

  function addHistory(entry) {
    state.history.unshift(entry);
    if (state.history.length > 5) state.history.pop();
    historyEl.innerHTML = "";
    state.history.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      historyEl.appendChild(li);
    });
  }

  // ---------- Entrée chiffres / décimale ----------
  function inputDigit(digit) {
    if (state.current === "Error") {
      state.current = digit;
      state.overwrite = false;
      return;
    }
    if (state.overwrite) {
      state.current = digit;
      state.overwrite = false;
      return;
    }
    if (state.current === "0" && digit === "0") {
      state.current = "0";
    } else if (state.current === "0" && digit !== "0") {
      state.current = digit;
    } else {
      state.current = state.current + digit;
    }
  }

  function inputDecimal() {
    if (state.current === "Error") {
      state.current = "0.";
      state.overwrite = false;
      return;
    }
    if (state.overwrite) {
      state.current = "0.";
      state.overwrite = false;
      return;
    }
    if (!state.current.includes(".")) state.current += ".";
  }

  // ---------- Opérateurs / évaluation ----------
  function chooseOperator(op) {
    if (state.current === "Error") return;

    // Si on change d'opérateur sans avoir saisi la 2eme valeur
    if (state.operator && state.overwrite) {
      state.operator = op;
      return;
    }

    if (state.previous !== null && state.operator) {
      const a = parseFloat(state.previous);
      const b = parseFloat(state.current);
      const r = safeCompute(a, b, state.operator);
      if (r === "Error") {
        state.current = "Error";
        state.previous = null;
        state.operator = null;
        state.overwrite = true;
        return;
      }
      state.current = String(r);
      state.previous = state.current;
    } else {
      state.previous = state.current;
    }

    state.operator = op;
    state.overwrite = true;
  }

  function evaluate() {
    if (state.previous === null || !state.operator) return;
    const a = parseFloat(state.previous);
    const b = parseFloat(state.current);
    const r = safeCompute(a, b, state.operator);

    const entry = `${formatNumber(state.previous)} ${state.operator} ${formatNumber(state.current)} = ${formatNumber(r === "Error" ? "Error" : String(r))}`;
    addHistory(entry);

    state.current = r === "Error" ? "Error" : String(r);
    state.previous = null;
    state.operator = null;
    state.overwrite = true;
  }

  // ---------- Commandes ----------
  function resetAll() {
    state.current = "0";
    state.previous = null;
    state.operator = null;
    state.overwrite = false;
    
  }

  function handleCommand(cmd) {
    switch (cmd) {
      case "AC": resetAll(); break;
      case "CE":
        state.current = "0";
        state.overwrite = false;
        break;
      case "neg":
        if (state.current === "Error") return;
        if (state.current === "0") return;
        state.current = state.current.startsWith("-") ? state.current.slice(1) : "-" + state.current;
        break;
      case "pct":
        if (state.current === "Error") return;
        state.current = String(Number((parseFloat(state.current) / 100).toFixed(12)));
        break;
    }
  }

  // ---------- Backspace ----------
  function deleteLast() {
    if (state.current === "Error" || state.overwrite) {
      state.current = "0";
      state.overwrite = false;
      return;
    }
    if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith("-"))) {
      state.current = "0";
    } else {
      state.current = state.current.slice(0, -1);
    }
  }

  // ---------- Écouteurs ----------
  keysEl.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    // debug rapide
    // console.log("cliquer:", button.dataset.type, button.dataset.value || button.textContent);
    handleClick(button);
  });

  // demo capture / bubble
  if (wrapper) {
    wrapper.addEventListener("click", () => console.log("bubble wrapper"));
    wrapper.addEventListener("click", () => console.log("capture wrapper"), { capture: true });
  }

  function handleClick(button) {
    const type = button.dataset.type;
    const value = button.dataset.value;
    if (type === "digit") inputDigit(value);
    else if (type === "decimal") inputDecimal();
    else if (type === "op") chooseOperator(value);
    else if (type === "eq") evaluate();
    else if (type === "cmd") handleCommand(value);
    updateDisplay();
  }

  // Support clavier
  document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
    const k = e.key;

    if (k >= "0" && k <= "9") inputDigit(k);
    else if (k === "." || k === ",") inputDecimal();
    else if (k === "+" || k === "-") chooseOperator(k);
    else if (k === "*" || k === "x" || k === "X") chooseOperator("×");
    else if (k === "/") chooseOperator("÷");
    else if (k === "Enter" || k === "=") { e.preventDefault(); evaluate(); }
    else if (k === "Backspace") deleteLast();
    else if (k === "Escape") handleCommand("AC");
    else if (k === "%") handleCommand("pct");

    updateDisplay();
  });

  // initial
  updateDisplay();
});