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
  ([panierBtn, commandeBtn] || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => { openModal($target); });
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

const urlFetch = "./trips.json";
const imgHolder = document.querySelector("#img-holder");
const listeResult = document.querySelector("#liste-result");
const resultZone = document.querySelector("#result-zone");

function generateArticle(trip) {
  const articleTrip = `<article><div class="columns">
    <div class="column is-1"><span class="icon"><i class="fa-solid fa-train"></i></span></div>
    <div class="column"><p class="has-text-weight-bold">${trip.departure} > ${trip.arrival}</p></div>
    <div class="column"><p>${new Date(trip.date.$date).getHours()}h${new Date(trip.date.$date).getMinutes()}</p></div>
    <div class="column"><p>${trip.price}€</p></div>
    <div class="column is-1">
      <div class="field">
        <div class="control">
          <button class="button is-rounded is-small add-cart">
            <span class="icon is-small"><i class="fa-solid fa-circle-plus"></i></span>
          </button>
        </div>
      </div>    
    </div>
  </div></article>`;

  listeResult.innerHTML += articleTrip;
}

// Action de recherche de voyage
document.querySelector("#search-btn").addEventListener("click", function() {
  const searchData = {
    dep: document.querySelector("#field-depart").value,
    arr: document.querySelector("#field-arrive").value,
    date: document.querySelector("#field-date").value
  };
  
  // console.log(date);

  fetch(urlFetch)
    .then(response => response.json())
    .then(trips => {
      const dummy = { result: true, trips };
      if (! dummy.result) {
        imgHolder.querySelector("img").src = "./images/into_the_night_empty.svg";
        imgHolder.querySelector("p").textContent = "Désolé, pas de destination pour votre demande...";
      } else {
        listeResult.classList.remove("is-hidden");
        imgHolder.classList.add("is-hidden");
        resultZone.querySelector("h2").classList.remove("is-hidden");
        listeResult.innerHTML = "";

        for (let trip of dummy.trips) {
          // console.log(trip.date.$date);
          const formatDate = (new Date(trip.date.$date)).toISOString().split('T')[0];
          if (formatDate === searchData.date && trip.departure === searchData.dep && trip.arrival === searchData.arr) {
            generateArticle(trip);
          }
        }
      }
    });

});