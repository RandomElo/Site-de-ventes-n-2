let divResultat = document.querySelector("#resultat");
// Fonction qui permet de récupérer les données qui sont dans le fichier SJON
function recuperationProduits() {
    return fetch("produits.json")
        .then((reponse) => {
            if (!reponse.ok) {
                throw new Error("Erreur dans la récupération des données");
            }
            return reponse.json();
        })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            return "Erreur dans le traitement de la donnée : " + error;
        });
}
function generationHtmlProduits(listeProduits) {
    let donneesProduits = "";
    for (let i = 0; i < listeProduits.length; i++) {
        let produit = /*html*/ `
        <div class="mt-3 p-2 w-25 bg-warning text-center">
            <p><span class="fw-bold">Nom : </span>${listeProduits[i].nom}</p>
            <p><span class="fw-bold">Marque : </span>${listeProduits[i].marque}</p>
            <p><span class="fw-bold">Prix : </span>${listeProduits[i].prix} €</p>
            <p><span class="fw-bold">Catégorie : </span>${listeProduits[i].categorie}</p>
            <form class="form_qte_produit" data-idproduit=${listeProduits[i].id}>
                <label for="${listeProduits[i].id}_input" class="me-2 fw-bold">Quantité : </label>
                <input type="number" class="w-25" id="${listeProduits[i].id}_input" required min="1">
                <button type="submit" class="m-2 btn btn-dark ">Ajouter au panier</button>
            </form>
        </div>`;
        donneesProduits += produit;
    }
    let produitHTML = `<div class="d-flex flex-column align-items-center">${donneesProduits}</div>`;
    divResultat.innerHTML = produitHTML;
    ajoutLocalStorage();
}
//Fonctio qui permet d'afficher les produits (pas par catégorie) et de gérer les événément lié (ajout dans localStorage)
async function affichageProduits() {
    var produitsBDD = await recuperationProduits();
    let produits = produitsBDD.produits;
    generationHtmlProduits(produits);
}
//Fonction qui permet sauvegarder la donnée de la modal dans localStorage
function ajoutLocalStorage() {
    document.querySelectorAll(".form_qte_produit").forEach((produit) => {
        produit.addEventListener("submit", (e) => {
            e.preventDefault();
            let idproduitCliquer = e.originalTarget.dataset.idproduit;
            let quantiteProduitCliquer = Number(e.originalTarget[0].value);
            e.originalTarget[0].value = "";
            let validationLocalStorage;
            for (let i = 0; i < localStorage.length; i++) {
                let elementLocalStorage = localStorage.getItem(i);
                let idElementLocalStorage = elementLocalStorage.split("_")[0];
                if (idproduitCliquer == idElementLocalStorage) {
                    localStorage.setItem(i, `${idElementLocalStorage}_${quantiteProduitCliquer + Number(elementLocalStorage.split("_")[1])}`);
                    validationLocalStorage = "valider";
                }
            }
            if (validationLocalStorage != "valider") {
                localStorage.setItem(localStorage.length == 0 ? 0 : localStorage.length, `${idproduitCliquer}_${quantiteProduitCliquer}`);
            }
        });
    });
}
//Gestion du bouton supprimer dans le panier
function supprimerProduitPanier(idproduit) {
    console.log("panier");
    let donneeLocalStorage = localStorage.getItem(idproduit);
    let split_id = donneeLocalStorage.split("_")[0];
    localStorage.setItem(idproduit, `${split_id}_0`);
    affichagePanier();
}
function modifierQuantitePanier() {
    document.querySelectorAll(".quantitePanier").forEach((input) => {
        input.addEventListener("input", (e) => {
            let quantiteModifier = e.target.value;
            let rangLocalStorage = e.target.parentNode.parentNode.dataset.idlocalstorage;
            if (quantiteModifier <= 0) {
                supprimerProduitPanier(rangLocalStorage);
            } else {
                let produit = localStorage.getItem(rangLocalStorage);
                localStorage.setItem(rangLocalStorage, `${produit.split("_")[0]}_${quantiteModifier}`);
                let prixUnitaire = document.querySelector(`#prixUniteID${rangLocalStorage}`);
                let prixTotalLigneElement = document.querySelector(`#totalID${rangLocalStorage}`);
                let valeurTotalLigne = Number(prixTotalLigneElement.textContent);
                let prixTotalLigneModifier = Number(quantiteModifier) * Number(prixUnitaire.textContent);
                prixTotalLigneElement.innerText = prixTotalLigneModifier;
                let prixPanier = document.querySelector("#totalPanier");
                prixPanier.innerText = prixPanier.textContent - valeurTotalLigne + prixTotalLigneModifier;
            }
        });
    });
}
//Fonction qui permet de gérer l'affichage du panier
async function affichagePanier() {
    if (localStorage.length == 0) {
        divResultat.innerHTML = /*html*/ `<h1 class="text-danger text-center m-2">Le panier est vide</h1>`;
    } else {
        var donneeJSON = await recuperationProduits();
        donneeJSON = donneeJSON.produits;
        var tableau_produit = ""; //Permet de stocker la partie du tableau générer avec la boucle for
        var compteurPrix = 0;
        var compteurProduitsPanier = 0;
        for (let i = 0; i < localStorage.length; i++) {
            let quantiteProduit = localStorage[i].split("_")[1]; //Peremt de récupérer la quantité du produit
            if (quantiteProduit != 0) {
                tableau_produit += /*html*/ `
                        <tr data-idLocalStorage=${i}>
                            <td>${donneeJSON[i].nom}</td>
                            <td><input type="number" value=${quantiteProduit} class="quantitePanier" style="width: 75px;"></td>
                            <td><span id="prixUniteID${i}">${donneeJSON[i].prix}</span> €</td>
                            <td><span id="totalID${i}">${quantiteProduit * donneeJSON[i].prix}</span> €</td>
                            <td><button class="boutonSupprProduit">Supprimer</button></td>
                        </tr>
                    `;
                compteurPrix += quantiteProduit * donneeJSON[i].prix;
                compteurProduitsPanier++;
            }
        }
        if (compteurProduitsPanier != 0) {
            divResultat.innerHTML = /*html*/ `
            <h1 class="text-center mb-2">Le Panier</h1>
            <table class="table table-light m-auto w-75">
                <thead>
                    <tr class="border-b  border-black">
                        <th>Nom</th>
                        <th>Quantité</th>
                        <th>Prix /u</th>
                        <th>Prix total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody class="border-b border-black">
                    ${tableau_produit}
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td></td>
                        <td class="fw-bold">Total : </td>
                        <td><span id="totalPanier">${compteurPrix}</span> €</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            `;
            //Permet de
            document.querySelectorAll(".boutonSupprProduit").forEach((boutonSupprimer) => boutonSupprimer.addEventListener("click", () => supprimerProduitPanier(boutonSupprimer.parentNode.parentNode.dataset.idlocalstorage)));
            modifierQuantitePanier();
        } else {
            divResultat.innerHTML = /*html*/ `<h1 class="text-danger text-center m-5">Le panier est vide</h1>`;
        }
    }
}
//fonction qui permet de supprimer les éléments du localStorage
function supprimerPanier() {
    document.querySelector("#panierSupprimer").addEventListener("click", () => {
        localStorage.clear();
        affichageProduits();
    });
}
async function affichageCategorie(categorie) {
    let produitsCategorie = {};
    var bdd = await recuperationProduits();
    let longeur = 0;
    bdd.produits.forEach((produit) => {
        if (produit.categorie == categorie) {
            produitsCategorie[longeur] = produit;
            longeur++;
        }
    });
    produitsCategorie["length"] = longeur;
    generationHtmlProduits(produitsCategorie);
}
//Fonction qui permet d'appeller chaque fonction
function appelFonctions() {
    affichageProduits();
    document.querySelector("#panierModifier").addEventListener("click", affichagePanier);
    supprimerPanier();
    document.querySelectorAll(".categorie").forEach((element) => element.addEventListener("click", () => affichageCategorie(element.dataset.categorieproduit)));
}
appelFonctions();
