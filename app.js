// import PokeApi from './script/PokeApi.js';

class PokeApi {
  constructor() {
    this.pokeURL = "https://pokeapi.co/api/v2/";
  }

  //Recibe una url para hacer una petición, retorna un objeto
  async getData(url) {
    try {
      const response = await fetch(this.pokeURL + url);
      const data = response.ok && (await response.json());

      return data;
    } catch (error) {
      console.error("💀ERROR ", error);
    }
  }

  //Recibe el nombre de un pokemon, retorna un objeto.
  async getPokemon(pokemonName) {
    const url = "pokemon/" + pokemonName;

    const pokemon = await this.getData(url);

    return pokemon;
  }

  //Recibe el nombre de un tipo, retorna un array con los pokemon del tipo escogido
  async getType(typeName) {
    const url = "type/" + typeName;
    const pokemonList = await this.getData(url);

    return pokemonList;
  }
}

class Pokemon {
  constructor(info) {
    this.name = info.name;
    this.id = info.id;
    this.weight = info.weight / 10;
    this.height = info.height * 10;

    this.types = this.getTypesArray(info);

    let unknownSprite = 'https://user-images.githubusercontent.com/68218563/197868839-9f80d72b-f65c-47af-8604-d4d2bfaba65b.png';

    this.frontSprite = info.sprites.front_default || unknownSprite;
    this.backSprite = info.sprites.back_default || unknownSprite;

    this.favorite = favoritePokemon.isFavorite(this);
  }

  //retorna un array con los nombres de los tipos
  getTypesArray(info) {
    let types = [];

    info.types.forEach((typeList) => {
      types.push(typeList.type.name);
    });

    return types;
  }

  typesToSpan() {
    let result = "";

    this.types.forEach((type) => {
      result += `<span class="type ${type}"></span>`;
    });

    return result;
  }

  getName() {
    const nameParts = this.name.split("-");

    return nameParts.join(" ");
  }

  toggleFavorite() {
    this.favorite = !this.favorite;
  }
}

class Card {
  constructor(pokemon) {
    this.pokemon = pokemon;
    this.htmlElement = this.buildHTMLElement(pokemon);
  }

  buildHTMLElement(pokemon) {
    const card = document.createElement("article");
    card.classList.add("card");

    const cardBody = this.getCardContent(pokemon);

    card.innerHTML = cardBody;
    this.setFullscreenEvent(card);

    return card;
  }

  setFullscreenEvent(card) {
    card.addEventListener("click", this.fullscreen.bind(this));
  }

  fullscreen() {
    const fullscreenView = new FullscreenView(this.pokemon);
    document.querySelector("body").appendChild(fullscreenView.html);
  }

  //Retorna un string con el html interno de las cards
  getCardContent(pokemon) {
    const typeElement = pokemon.typesToSpan();

    const cardBody = `
      <div class="card-header">
          <figure class="pokesprite" style="background-image: url('${pokemon.frontSprite}')"></figure>
          <h4>${pokemon.getName()}</h4>
          <span class="pokemon-id">${pokemon.id}</span>
      </div>
      <div class="card-body">
          <div class="types-container">
              ${typeElement}
          </div>
          <p class="poke-stat">
              HEIGHT: <span>${pokemon.height}cm</span>
          </p>
          <p class="poke-stat">
              WEIGHT: <span>${pokemon.weight}kg</span>
          </p>
      </div>
      <div class="selected-card"></div>
    `;

    return cardBody;
  }
}

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

    (type)
     ? response = this.poke.getType(string) || new Promise( (resolve, rejected) => rejected())
     : response = this.poke.getPokemon(string) || new Promise( (resolve, rejected) => rejected());

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
        : new Promise( rejected => rejected());

      //si ambas respuestas son null, se esta repitiendo la ultima busqueda
      if(!(pokemon && pokemonList)) {
        this.showDownArrow();
        return;
      }
      
      this.notify.reset();
      this.loading.loadingStart();
      this.latestSearch = string;
      
      pokemon.then((response) => {
        if(response) {
          this.buildCardContainer(response);
          this.loading.alert();
        } else {
          this.noResult('poke', string)
        }
      });
  
      pokemonList.then((response) => {
        if(response) {
          this.buildCardContainer(response);
          this.loading.alert();
        } else {
          this.noResult('type', string)
        }
      });

    };

    this.button.onclick = inputSearch;

    //Habilita realizar la búsqueda al presionar enter
    this.input.addEventListener('keypress', (e) => {
      if (e.key == 'Enter') {
        document.querySelector('.search-button').click();
        document.querySelector('.search-button').focus();
      }
    })

    //Evento boton mostrar favoritos
    document.querySelector('.show-favorites__hitbox').addEventListener('click', this.showFavorites.bind(this));
    
    //Evento focus buscador en la lupa
    document.querySelector('.focus-searcher__helper').addEventListener('click', () => setTimeout(() => this.button.focus(), 300));

    this.setPokemonTypesEvent(); 
  }

  setPokemonTypesEvent() {
    const typeList = document.querySelector('.type-list');
    console.log(typeList)
    typeList.childNodes.forEach( type => {
      const types = type.classList?.value;
      if(!types) return;

      type.addEventListener('click', () => {
        this.input.value = types.split(' ')[1];
        this.button.click();
        setTimeout(() => this.button.focus(), 500);
      });
    });
  }

  showFavorites() {
    const idList = favoritePokemon.favorites;
    this.latestSearch = 'favorites';
    this.cardsContainer.innerHTML = (idList.length)
      ? ''
      : 'try searching something...';

    //Si no hay favoritos
    if(idList.length == 0){
      this.noFavoritesYet();
      return;
    }

    idList.forEach(id => {
      const result = this.poke.getPokemon(id);

      result.then((response) => {
        this.addPokemon(response);
      });
    })

    this.favoritesDisplayed(idList);
  }

  noFavoritesYet() {
    showToast({
      text: `no favorite pokemon yet :(`,
      duration: 3000,
      position: 'center',
      gravity: 'bottom',
      className: 'yellow'
    });
  }
  
  favoritesDisplayed({length}) {
    showToast({
      text: `${length} favorite pokemon found`,
      duration: 3000,
      position: 'center',
      gravity: 'top',
      className: 'green'
    });
    setTimeout(() => this.toggleSearcherFocusButton(), 500);
    this.showDownArrow();
  }

  //Construye array con todos los resultados de la búsqueda
  buildCardContainer(data) {
    // Borra el resultado de la búsqueda anterior
    this.latestResult = [];
    this.cardsContainer.innerHTML = '';

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
      showSearchToast(string, "green", data.pokemon?.length || 1);
    }, 500);

    this.showDownArrow();
  }

  toggleSearcherFocusButton() {
    const containerHeight = this.cardsContainer.clientHeight;
    const viewportHeight = window.visualViewport.height;

    const helperButton = document.querySelector('.focus-searcher__helper');

    (containerHeight > viewportHeight * 0.6)
    ? helperButton.hidden = false
    : helperButton.hidden = true;
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
    document.querySelector('main').hidden = false;
    this.cardsContainer.appendChild(card);
  }

  noResult(type, string) {
    this.notify[type](string);
    this.loading.alert();
  }

  validSearch(string) {
    if (string === "") return false;

    if (string == this.latestSearch) {
      showSearchToast();
      return false;
    }

    this.latestNotification = null;
    return true;
  }

  showDownArrow() {
    const arrow = document.querySelector('.down-arrow');
    arrow.classList.add('move');
    setTimeout(() => arrow.classList.remove('move'), 3000);
  }
}

class FullscreenView {
  constructor(pokemon) {
    this.pokemon = pokemon;
    this.favoriteButton = this.getFavoriteButton();
    this.html = this.buildHTML();
  }

  //construye la fullscreenView
  buildHTML() {
    const container = document.createElement("div");
    container.classList.add("fullscreen-view__container");
    container.appendChild(this.getInnerHTML());

    return container;
  }

  //retorna la card del pokemon para visualizar en fullscreen
  getInnerHTML() {
    const fullview = document.createElement('div');
    fullview.classList.add('card');
    fullview.classList.add('fullview');

    const innerHTML = `
      <figure style="background-image: url('${this.pokemon.frontSprite}')"></figure>
      <h2 class="pokemon-name">${this.pokemon.getName()}</h2>
      <span class="pokemon-id">${this.pokemon.id}</span>
      <div class="favorite-button"></div>

      <div class="pokemon-stats">
        <p class="poke-stat">Height: ${this.pokemon.height}cm</p>
        <p class="poke-stat">Weight: ${this.pokemon.weight}Kg</p>
      </div>
    `;
    
    fullview.innerHTML = innerHTML;
    fullview.appendChild(this.getCloseButton());
    fullview.appendChild(this.favoriteButton);

    return fullview;
  }

  //Retorna el boton para cerrar la fullscreenView
  getCloseButton() {
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.innerHTML = 'X';
    
    const buttonHitBox = document.createElement('div');
    buttonHitBox.classList.add('hitbox');

    closeButton.appendChild(buttonHitBox);

    buttonHitBox.addEventListener('click', () => {
      closeButton.parentElement.parentElement.remove();
    });

    return closeButton;
  }

  //retorna elemento botón para añadir a favoritos
  getFavoriteButton() {
    const favoriteButton = document.createElement('div');
    favoriteButton.classList.add('favorite-button');

    this.updateFavoriteBackground(favoriteButton);

    favoriteButton.addEventListener('click', this.favoriteButtonClick.bind(this));

    return favoriteButton;
  }

  //Funcion que se ejecutará en el evento click del favoriteButton
  favoriteButtonClick() {
    this.pokemon.toggleFavorite();
    this.updateFavoriteBackground();
    const pokeStatus = favoritePokemon.toggleFavorite(this.pokemon);

    new Audio('https://soundboardguy.com/wp-content/uploads/2021/05/pokemon-a-button.mp3').play();
  }

  //Actualiza el fondo del botón favoritos
  updateFavoriteBackground(favoriteButton = this.favoriteButton) {
    const background = this.getFavoriteBackground();
    favoriteButton.innerHTML = `<figure style="background-image: url('${background}')">`;
  }

  //Retorna el fondo correspondiente en función de this.favorite
  getFavoriteBackground() {
    const background = (this.pokemon.favorite)
      ? 'https://user-images.githubusercontent.com/68218563/198399898-2aa28e32-a2bf-4be5-9d6c-95c74550275d.png'
      : 'https://user-images.githubusercontent.com/68218563/198399927-0de6b962-8dc8-404b-ad84-6d3b47ad4a5c.png';

    return background;
  }
}

const showSearchToast = (string, type, count) => {
  const toastInfo =
    searcher.latestNotification || getToast(string, type, count);

  showToast(toastInfo);
};

const showToast = (toastConfig) => {
  const currentToast = document.querySelector(".toastify");

  if (currentToast) currentToast.remove();

  Toastify(toastConfig).showToast();
}

//Retorna un objeto de configuración toast según parametros
//String=nombre pokemon, type=tipo de notificacion, count=numero de pokes
const getToast = (string, type, count) => {
  if (type == "green") {
    count > 1
      ? (string = `${count} ${string} pokemon found`)
      : (string = `${string} found`);
  } else {
    string = `${string} not found`;
  }

  const toast = {
    text: string,
    duration: 3000,
    position: "center",
    gravity: "top",
    className: type,
  };

  searcher.latestNotification = toast;

  return toast;
};

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
      this.verify(string);
    },
    type(string) {
      typeSuccess = false;
      this.verify(string);
    },
    verify(string) {
      const gottaNotify = !(pokeSuccess || typeSuccess);
      gottaNotify ? showSearchToast(string, "red") : "";
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

const favoritePokemon = {
  favorites: JSON.parse(localStorage.getItem('favoritePokemon')) || [],

  //Agrega o quita un pokemon de la lista de favoritos.
  //Retorna true si se agregó, false si se quitó
  toggleFavorite(pokemon) {
    let pokeStatus = this.isFavorite(pokemon);
    (pokeStatus)
      ? this.remove(pokemon)
      : this.add(pokemon);

    this.updateLocalStorage();

    return !pokeStatus;
  },
  
  add({name, id}) {
    this.favorites.push(id);

    showToast({
      text: `${name} added to favorites`,
      duration: 3000,
      position: 'center',
      gravity: 'bottom',
      className: 'yellow'
    });
  },

  remove({name, id}) {
    const index = this.favorites.indexOf(id);
    this.favorites.splice(index, 1);

    showToast({
      text: `${name} removed from favorites`,
      duration: 3000,
      position: 'center',
      gravity: 'bottom',
      className: 'red'
    });
  },

  updateLocalStorage() {
    const localData = JSON.stringify(this.favorites);
    localStorage.setItem('favoritePokemon', localData);
  },

  isFavorite(pokemon) {
    return this.favorites.includes(pokemon.id);
  }
};

const searcher = new Searcher();
document.querySelector('main').hidden = true;
