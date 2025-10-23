/* initialisation des variables */ // hna ghadi n3mro lvariables
const displayEl = document.getElementById('display'); // kanjib lélément li 3ando id="display" باش yban fih résultat
const keysEl = document.getElementById('keys'); // kanjib lélément li fih les boutons dyal calculatrice
const historyBtn = document.getElementById('historyBtn'); // kanjib bouton li kayb9a ywarri/ikhfi lhistorique
const historyList = document.getElementById('historyList'); // kanjib liste fin ybanw les calculs l9damin

const etat = { // objet kaykhzn lina l7ala dyal calculatrice
    valeurAffichee: '0', // l9ima li tban f display mn lwal (par défaut sifr)
    expression: "", // l3ibara dyal l7isab 
    isOperateur: false, //  bach n3rf wach lakhir li dkhal opérateur wla la
    historique: [] // tableau fin n7afdo calculat li darna qbel
};

function formatResult(n) { // fonction katformatta résultat
    if (Number.isFinite(n)) { // ila kan n ra9m sahih
        let fixed = Number.parseFloat(n.toFixed(2)); // tqad b 2 chiffres ba3d lvirgule
        return fixed.toString(); // rje3ha texte باش tban 
    }
    return 'Erreur'; // ila makanch sahih rje3 Erreur
}

/** Dernier element */
function dernierCaractaire() { // fonction katjib lakhir caractère men expression
    let chaine = etat.expression.match(/(\d+\.?\d*|√\(|[+\-*/%])/g); // kan9smou l3ibara  b chiffre w symboles
    if (!chaine) return ""; // ila makayn walo rje3o khawi
    return chaine[chaine.length - 1]; // rje3 akhir caractère
    
}
/* Affichage */
function updateDisplay() { // fonction katbadel shno kayban f display
    displayEl.textContent = etat.valeurAffichee; // kat7et valeur actuelle f display
}

/* Maj Historique */
function majHistorique(expr, resultat) { // fonction kat9ayd opération f historique
    etat.historique.unshift(${expr} = ${resultat}); // katzid opération jdida f liste mn lfo9
    if (etat.historique.length > 5) etat.historique.pop(); // ila fayt 5 dial operation nhiydo lkhra
    historyList.innerHTML = etat.historique.map(item => <li>${item}</li>).join(""); // n ajoutiwhom f liste
    historyList.querySelectorAll("li").forEach(li => { // 3tina event kol élément dial la liste 
        li.addEventListener("click", () => { // ila kliki 3la résultat men historique
            const res = li.textContent.split(" = ")[1]; // jib résultat mora =
            etat.valeurAffichee = res; // 7et résultat f display
            etat.expression = res; // khzn résultat f expression
            updateDisplay(); // n3yat 3la fct li kat update  display
            historyList.style.display = "none"; // makanbynoch la liste
        });
    });
}

/* Gestion des chiffres */
function gererChiffre(chiffre) { // fonction li kat9ayd chi chiffre
    if (etat.isOperateur) { // ila kan opérateur dkhal qbel
        etat.valeurAffichee = chiffre; // bda mn jd
        etat.isOperateur = false; // hna akhir haja ajoutina hiya chiffre machi operateur
    } else {
        etat.valeurAffichee = (etat.valeurAffichee === '0') ? chiffre : etat.valeurAffichee + chiffre; // zid 3la l9dim ila déjà zdna un chiffre 9bl
    }
    etat.expression+=chiffre; // zid chiffre f expression
}

/* Gestion des opérateurs */
function gererOperateur(op) { // fonction kat9ayd opérateur
    if (etat.isOperateur) { // ila deja kayn opérateur
        etat.expression = etat.expression.slice(0, -1) + op; // bdel lakhir b jdid ila kna dra 2 operateur mtab3in ghayakhd jdid
    } else {
        etat.expression += op; // zid opérateur jdid
    }
    etat.isOperateur = true; // bdel test sur operation ==> dernier ajoute c'est une opr
}

/* Gestion du bouton = */
function gererEgal() { // bouton =
    if (!etat.expression) return; // ila expression khawya matdir walo
    let result = Operate(); // 7seb résultat
    majHistorique(etat.expression, result); // zidha f historique
    etat.valeurAffichee = result; // khzn résultat f valeurAffichee
    etat.expression = result; // khzn résultat f expression
    etat.isOperateur = false; // bdel test sur operation ==> dernier ajoute est un chiffre
}

/* Gestion des commandes spéciales */
function gererCommande(cmd) { // fonction AC, CE, neg, √, sqr, pct
    let val = parseFloat(etat.valeurAffichee); // converti valeur l nombre
    switch (cmd) {
        case 'AC': // ms7 kolchi
            etat.valeurAffichee = '0';
            etat.expression = '';
            etat.isOperateur = false;
            etat.historyList=[];
            break;
        case 'CE': // ms7 lakhir caractère
            etat.expression = etat.expression.slice(0,-1);
            if(etat.expression===''){
                etat.valeurAffichee='0';
            }
            else{
                etat.valeurAffichee = etat.expression;
            }
            
            break;
        case 'neg': // bdel signe
            if (!isNaN(val)) {
                etat.valeurAffichee = (val * -1).toString();
                etat.expression = etat.valeurAffichee;
            }
            break;
        case '√': // racine carrée
            if (!isNaN(val)) {
                let res = Math.sqrt(val);
                etat.valeurAffichee = formatResult(res);
                etat.expression = etat.valeurAffichee;
            }
            else{
                etat.expression+='√'; // ila dkhalna √ f lwl khaliha symbole
            }
            break;
        case 'sqr': // carré
            if (!isNaN(val)) {
                let sq = Math.pow(val, 2);
                etat.valeurAffichee = formatResult(sq);
                etat.expression = etat.valeurAffichee;
            }
            break;
        case 'pct': // pourcentage
            if (!isNaN(val)) {
                let p = val / 100;
                etat.valeurAffichee = formatResult(p);
                etat.expression = etat.valeurAffichee;
            }
            break;
    }
}

/* Fonction d'opération */
function Operate() { // fonction li kay7seb expression
    let exp = etat.expression
        .replace(/÷/g, '/') 
        .replace(/×/g, '*') 
        .replace(/√\(([^)]+)\)/g,'Math.sqrt($1)') // hseb racine li f ()
        .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)'); // hseb racine dyal raqm bla ()
    try {
        let result = new Function('return ' + exp)(); // exécuter expression
        return formatResult(result); // résultat formaté
    } catch {
        return "Erreur"; // ila wa9a chi erreur
    }
}

/* Support Clavier */
document.addEventListener("keydown", e => { // support clavier
    if (!isNaN(e.key)) gererChiffre(e.key); // ila dkhal chiffre
    if (["+", "-", "*", "/"].includes(e.key)) gererOperateur(e.key); // ila opérateur
    if (e.key === "Enter") { e.preventDefault(); gererEgal(); } // ila Enter
    if (e.key === "Backspace") { // ms7 lakhir
        etat.valeurAffichee = etat.valeurAffichee.slice(0, -1) || "0";/**msh akhir caractaire mli mayb9a ta chi carataire à supp affiche 0 */
        etat.expression = etat.expression.slice(0, -1);
    }
    updateDisplay(); // bdel affichage
});

/* Evénement Click */
keysEl.addEventListener("click", e => { // support click 3la boutons
    if (!e.target.matches("button")) return; // ila machi bouton matdir walo
    let { type, value } = e.target.dataset; // jib type w value

    if(value==="√"){ // cas spécial √
        let dernier = dernierCaractaire();
        if(etat.valeurAffichee==="0" && etat.expression==="" || ["+", "-", "*", "/"].includes(dernier)){
            type="digit"; // ghat tkon bhal chi nb
        } else {
            type="cmd"; // khaliha commande
        }
    }

    if (type === "digit") gererChiffre(value); // ila chiffre
    if (type === "op") gererOperateur(value); // ila opérateur
    if (type === "eq") gererEgal(); // ila =
    if (type === "cmd") gererCommande(value); // ila commande

    updateDisplay(); // bdel affichage
});

/* Historique bouton */
historyBtn.addEventListener("click", () => { // support bouton historique
    historyList.style.display = (historyList.style.display === "block") ? "none" : "block"; // afficher/ikhfi
});
document.addEventListener("click", (e) => { // ila kliki 3la chi 7aja khra
    if (!e.target.matches('#historyBtn')) {
        historyList.style.display = "none"; // khbi historique
    }
});