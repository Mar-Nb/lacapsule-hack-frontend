const urlFetch = "http://localhost:3000/";

function generateArticle(trip, action = undefined) {
  let articleTrip = `<article><input type='hidden' value='${trip._id}'><div class="columns">
    <div class="column is-1"><span class="icon"><i class="fa-solid fa-train"></i></span></div>
    <div class="column"><p class="has-text-weight-bold">${trip.departure} > ${trip.arrival}</p></div>
    <div class="column"><p>${new Date(trip.date).getUTCHours()}h${new Date(trip.date).getUTCMinutes()}</p></div>
    <div class="column"><p>${trip.price}€</p></div>`;
  
  if (action !== undefined) {
    const colBtn = "<div class='column is-1'><div class='field'><div class='control'>";
    if (action === "add") {
      articleTrip += colBtn + "<button class='button is-rounded is-small add-cart'><span class='icon is-small'><i class='fa-solid fa-circle-plus'></i></span></button></div></div></div>";
    } else if (action === "del") {
      articleTrip += colBtn + "<button class='button is-rounded is-small del-cart'><span class='icon is-small'><i class='fa-solid fa-trash'></i></span></button></div></div></div>";
    }
  }

  articleTrip += "</div></article>";

  return articleTrip;
}

// Pour pouvoir afficher les boutons de la navbar en mode mobile (cf. doc de Bulma)
document.addEventListener("DOMContentLoaded", () => {
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);

  // Add a click event on each of them
  $navbarBurgers.forEach( el => {
    el.addEventListener("click", () => {

      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle("is-active");
      $target.classList.toggle("is-active");
    });
  });
});

// Pour pouvoir afficher les modals de la page (Panier et Commandes)
document.addEventListener("DOMContentLoaded", () => {
  // Functions to open and close a modal
  function openModal($el) { $el.classList.add("is-active"); }

  function closeModal($el) { $el.classList.remove("is-active"); }

  function closeAllModals() {
    (document.querySelectorAll(".modal") || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  const panierBtn = document.querySelector("#panier-btn");
  const commandeBtn = document.querySelector("#commande-btn");
  // ([panierBtn, commandeBtn] || []).forEach(($trigger) => {
  //   const modal = $trigger.dataset.target;
  //   const $target = document.getElementById(modal);

  //   $trigger.addEventListener('click', () => { openModal($target); });
  // });

  // Gestion du modal du panier
  const modalPanier = panierBtn.dataset.target;
  const $targetPanier = document.getElementById(modalPanier);
  panierBtn.addEventListener("click", () => {
    fetch(urlFetch + "panier/")
      .then(response => response.json())
      .then(panier => {
        // Remplissage du panier
        $targetPanier.querySelector("section.modal-card-body").innerHTML = "";

        for (const trip of panier.trips) {
          $targetPanier.querySelector("section.modal-card-body").innerHTML += generateArticle(trip, "del");
        }

        document.querySelector("#panier-total").textContent = panier.total;

        // Action de suppression au clic
        document.querySelectorAll(".del-cart").forEach(btn => {
          btn.addEventListener("click", function() {
            const id = btn.closest("article").firstChild.value;
            fetch(urlFetch + "panier/" + id, {
              method: "DELETE"
            })
            .then(response => response.json())
            .then(deleted => {
              if (deleted.result) { btn.closest("article").remove(); }
            })
          });
        });

        document.querySelector("#comm-panier").addEventListener("click", function() {
          const ids = [];
          document.querySelectorAll(`#${$targetPanier.id} input`).forEach(input => ids.push(input.value));

          fetch(urlFetch + "commande/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ids})
          })
          .then(response => response.json())
          .then(() => {})
        });

        openModal($targetPanier);
      })
  });

  // Gestion du modal des commandes
  const modalCommande = commandeBtn.dataset.target;
  const $targetCommande = document.getElementById(modalCommande);
  commandeBtn.addEventListener("click", () => {
    fetch(urlFetch + "commande/")
      .then(response => response.json())
      .then(commande => {
        // Remplissage du panier
        $targetCommande.querySelector("section.modal-card-body").innerHTML = "";

        for (const trip of commande.trips) {
          $targetCommande.querySelector("section.modal-card-body").innerHTML += generateArticle(trip);
        }

        openModal($targetCommande);
      })
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => { closeModal($target); });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    const e = event || window.event;

    if (e.keyCode === 27) { // Escape key
      closeAllModals();
    }
  });
});

// *******************************************************************************************************

const imgHolder = document.querySelector("#img-holder");
const listeResult = document.querySelector("#liste-result");
const resultZone = document.querySelector("#result-zone");

// Action de recherche de voyage
document.querySelector("#search-btn").addEventListener("click", function() {
  const searchData = {
    departure: document.querySelector("#field-depart").value.length !== 0 ? document.querySelector("#field-depart").value : null,
    arrival: document.querySelector("#field-arrive").value.length !== 0 ? document.querySelector("#field-arrive").value : null,
    date: document.querySelector("#field-date").value.length !== 0 ? document.querySelector("#field-date").value : null
  };
  
  console.log(searchData);

  fetch(urlFetch + "trips/sortByDate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchData)
  })
    .then(response => response.json())
    .then(allTrips => {
      document.querySelector("#nb-trips").textContent = allTrips.trips.length;
      if (! allTrips.result) {
        imgHolder.querySelector("img").src = "./images/into_the_night_empty.svg";
        imgHolder.querySelector("p").textContent = "Désolé, pas de destination pour votre demande...";
      } else {
        listeResult.classList.remove("is-hidden");
        imgHolder.classList.add("is-hidden");
        resultZone.querySelector("h2").classList.remove("is-hidden");
        listeResult.innerHTML = "";

        for (let trip of allTrips.trips) {
          listeResult.innerHTML += generateArticle(trip, "add");
        }
      }

      document.querySelectorAll(".add-cart").forEach(btn => {
        btn.addEventListener("click", function() {
          const idTrip = this.closest("article").querySelector("input").value;

          fetch(urlFetch + "panier/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: idTrip })
          })
          .then(response => response.json())
          .then(() => {})
        });
      });
    });
});