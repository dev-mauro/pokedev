import Card from "./Card.js";
import PokeApi from "./PokeApi.js";
import Pokemon from "./Pokemon.js";
import { showToast, showSearchToast } from "./Toast.js";

class Searcher {
  constructor() {
    this.input = document.querySelector(".searcher .text-input");
    this.button = document.querySelector(".searcher .search-button");
    this.cardsContainer = document.querySelector(".cards-container");
    this.poke = new PokeApi();
    this.latestResult = [];
    this.latestSearch = null;
    this.latestNotification = {};
    this.notify = Notify();
    this.loading = Loading();

    this.setEvents();
    this.toggleSearcherFocusButton();
  }

  search(string, type = false) {
    if (!this.validSearch(string)) return;
    string = string.toLowerCase();

    let response;

    type
      ? (response =
          this.poke.getType(string) ||
          new Promise((resolve, rejected) => rejected()))
      : (response =
          this.poke.getPokemon(string) ||
          new Promise((resolve, rejected) => rejected()));

    return response;
  }

  //Setea los eventos relacionados al buscador
  setEvents() {
    //Realiza la búsqueda con la info del input
    const inputSearch = () => {
      const string = this.input.value;

      const pokemon = this.search(string);
      const pokemonList = isNaN(string)
        ? this.search(string, true)
        : new Promise((rejected) => rejected());

      //si ambas respuestas son null, se esta repitiendo la ultima busqueda
      if (!(pokemon && pokemonList)) {
        this.showDownArrow();
        return;
      }

      this.notify.reset();
      this.loading.loadingStart();
      this.latestSearch = string;

      pokemon.then((response) => {
        if (response) {
          this.buildCardContainer(response);
          this.loading.alert();
        } else {
          this.noResult("poke", string);
        }
      });

      pokemonList.then((response) => {
        if (response) {
          this.buildCardContainer(response);
          this.loading.alert();
        } else {
          this.noResult("type", string);
        }
      });
    };

    this.button.onclick = inputSearch;

    //Habilita realizar la búsqueda al presionar enter
    this.input.addEventListener("keypress", (e) => {
      if (e.key == "Enter") {
        document.querySelector(".search-button").click();
        document.querySelector(".search-button").focus();
      }
    });

    //Evento boton mostrar favoritos
    document
      .querySelector(".show-favorites__hitbox")
      .addEventListener("click", this.showFavorites.bind(this));

    //Evento focus buscador en la lupa
    document
      .querySelector(".focus-searcher__helper")
      .addEventListener("click", () =>
        setTimeout(() => this.button.focus(), 300)
      );

    this.setPokemonTypesEvent();
  }

  setPokemonTypesEvent() {
    const typeList = document.querySelector(".type-list");
    typeList.childNodes.forEach((type) => {
      const types = type.classList?.value;
      if (!types) return;

      type.addEventListener("click", () => {
        this.input.value = types.split(" ")[1];
        this.button.click();
        setTimeout(() => this.button.focus(), 500);
      });
    });
  }

  //Muestra los pokemon en la lista de favoritos
  showFavorites() {
    const idList = JSON.parse(localStorage.getItem("favoritePokemon")) || [];
    this.latestSearch = "favorites";
    this.cardsContainer.innerHTML = idList.length
      ? ""
      : "try searching something...";

    //Si no hay favoritos
    if (idList.length == 0) {
      this.noFavoritesYet();
      return;
    }

    idList.forEach((id) => {
      const result = this.poke.getPokemon(id);

      result.then((response) => {
        this.addPokemon(response);
      });
    });

    this.favoritesDisplayed(idList);
  }

  //Desplega la notificacion de no hay pokemon favoritos
  noFavoritesYet() {
    showToast({
      text: `no favorite pokemon yet :(`,
      duration: 3000,
      position: "center",
      gravity: "bottom",
      className: "yellow",
    });
  }

  //Desplega notificacion de pokemon favoritos encontrados
  favoritesDisplayed({ length }) {
    showToast({
      text: `${length} favorite pokemon found`,
      duration: 3000,
      position: "center",
      gravity: "top",
      className: "green",
    });
    setTimeout(() => this.toggleSearcherFocusButton(), 500);
    this.showDownArrow();
  }

  //Construye array con todos los resultados de la búsqueda
  buildCardContainer(data) {
    // Borra el resultado de la búsqueda anterior
    this.latestResult = [];
    this.cardsContainer.innerHTML = "";

    //Caso en que data sea una lista de pokemons
    if (data.pokemon) {
      data.pokemon.forEach((pokemon) => {
        const result = this.poke.getPokemon(pokemon.pokemon.name);

        result.then((response) => {
          this.addPokemon(response);
        });
      });

      //Caso en que data es un solo pokemon
    } else {
      this.addPokemon(data);
    }

    const string = this.input.value;
    setTimeout(() => {
      this.toggleSearcherFocusButton();
      this.latestNotification = showSearchToast(
        string,
        "green",
        data.pokemon?.length || 1
      );
    }, 500);

    this.showDownArrow();
  }

  //Cambia la visibilidad del boton para volver al buscador
  toggleSearcherFocusButton() {
    const containerHeight = this.cardsContainer.clientHeight;
    const viewportHeight = window.visualViewport.height;

    const helperButton = document.querySelector(".focus-searcher__helper");

    containerHeight > viewportHeight * 0.6
      ? (helperButton.hidden = false)
      : (helperButton.hidden = true);
  }

  //Construye la carta para agregarla al cardContainer
  addPokemon(pokeInfo) {
    const pokemon = new Pokemon(pokeInfo);
    const card = new Card(pokemon);
    this.pushLatestResult(card);
    this.addCard(card.htmlElement);
  }

  //Agrega al array el resultado de la búsqueda
  pushLatestResult(card) {
    this.latestResult.push(card);
  }

  //Añade la card a cardContainer
  addCard(card) {
    document.querySelector("main").hidden = false;
    this.cardsContainer.appendChild(card);
  }

  noResult(type, string) {
    const noti = this.notify[type](string);
    this.loading.alert();

    if (noti) this.latestNotification = noti;
  }

  validSearch(string) {
    if (string === "") return false;

    if (string == this.latestSearch) {
      showToast(this.latestNotification);
      return false;
    }

    this.latestNotification = null;
    return true;
  }

  showDownArrow() {
    const arrow = document.querySelector(".down-arrow");
    arrow.classList.add("move");
    setTimeout(() => arrow.classList.remove("move"), 3000);
  }
}

const Notify = () => {
  let pokeSuccess = true;
  let typeSuccess = true;

  return {
    reset() {
      pokeSuccess = true;
      typeSuccess = true;
    },
    poke(string) {
      pokeSuccess = false;
      return this.verify(string);
    },
    type(string) {
      typeSuccess = false;
      return this.verify(string);
    },
    verify(string) {
      const gottaNotify = !(pokeSuccess || typeSuccess);
      if (gottaNotify) return showSearchToast(string, "red");
    },
  };
};

const Loading = () => {
  let loading = false;
  let receivedAlerts = 0;
  const logo = document.querySelector(".logo");

  return {
    reset() {
      loading = false;
      receivedAlerts = 0;
    },
    loadingStart() {
      loading = true;
      receivedAlerts = 0;
      logo.src =
        "https://user-images.githubusercontent.com/68218563/197868253-ea68bd8c-1c41-4b8b-8e72-c32f6af31f57.gif";
    },
    alert() {
      receivedAlerts++;
      this.verify();
    },
    verify() {
      if (receivedAlerts == 2) {
        logo.src =
          "https://user-images.githubusercontent.com/68218563/197868213-fea100fe-a347-4038-8629-ad4726344d00.png";
        this.reset();
      }
    },
  };
};

export default Searcher;
