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

    this.frontSprite = info.sprites.front_default;
    this.backSprite = info.sprites.back_default;
  }

  //retorna un array con los nombres de los tipos
  getTypesArray(info) {
    let types = [];

    info.types.forEach((typeList) => {
      types.push(typeList.type.name);
    });

    return types;
  }
}

class Card {
  constructor(pokemon) {
    this.htmlElement = this.buildHTMLElement(pokemon);
  }

  buildHTMLElement(pokemon) {
    const typeElement = this.typesToSpan(pokemon.types);

    const sprite =
      pokemon.frontSprite ||
      "https://user-images.githubusercontent.com/68218563/197868839-9f80d72b-f65c-47af-8604-d4d2bfaba65b.png";

    const name = this.formatName(pokemon.name);

    const card = `
        <article class="card">
            <div class="card-header">
                <figure class="pokesprite" style="background-image: url('${sprite}')"></figure>
                <h4>${name}</h4>
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
        </article>
        `;

    return card;
  }

  typesToSpan(typeArray) {
    let result = "";

    typeArray.forEach((type) => {
      result += `<span class="type ${type}"></span>`;
    });

    return result;
  }

  formatName(name) {
    const nameParts = name.split("-");

    return nameParts.join(" ");
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
  }

  //Realiza petición a la PokeAPI con la string
  search(string) {
    if (!this.validSearch(string)) return;

    string = string.toLowerCase();

    const pokemon = this.poke.getPokemon(string);
    const pokemonList = this.poke.getType(string);

    this.notify.reset();
    this.loading.loadingStart();
    this.latestSearch = string;

    pokemon.then((response) => {
      response
        ? this.buildLatestResult(response)
        : this.noResult('poke', string);
      });
      
    pokemonList.then((response) => {
      response
        ? this.buildLatestResult(response)
        : this.noResult('type', string);
    });
  }

  //Setea los eventos relacionados al buscador
  setEvents() {
    const inputSearch = () => {
      const string = this.input.value;
      this.search(string);
    };

    //Evento para obtener la string del input al presionar el boton buscar
    this.button.onclick = inputSearch;
  }

  //Construye array con todos los resultados de la búsqueda
  buildLatestResult(data) {
    // Borra el resultado de la búsqueda anterior
    this.latestResult = [];
    this.cardsContainer.innerHTML = "";

    //Caso en que data sea una lista de pokemons
    if (data.pokemon) {
      data.pokemon.forEach((pokemon) => {
        const result = this.poke.getPokemon(pokemon.pokemon.name);

        result.then((response) => {
          const newPokemon = new Pokemon(response);
          this.pushLatestResult(newPokemon);
        });
      });
    } else {
      const newPokemon = new Pokemon(data);
      this.pushLatestResult(newPokemon);
    }

    const string = this.input.value;
    setTimeout(() => {
      showToast(string, 'green', data.pokemon?.length || 1)
    }, 500)
    this.loading.alert();
  }

  //Agrega al array el resultado de la búsqueda
  pushLatestResult(pokemon) {
    const card = new Card(pokemon);
    //console.log(pokemon.name, pokemon);

    this.latestResult.push(pokemon);

    document.querySelector("main").hidden = false;
    this.cardsContainer.innerHTML += card.htmlElement;
  }

  noResult(type, string) {
    this.notify[type](string);
    this.loading.alert();
  }

  validSearch(string) {
    if(string === '')
      return false;

    if (string == this.latestSearch){
      showToast();
      return false;
    }

    this.latestNotification = null;
    return true;
  }
}

const showToast = (string, type, count) => {
  const currentToast = document.querySelector('.toastify');

  if(currentToast) currentToast.remove();

  const toastInfo = searcher.latestNotification || getToast(string, type, count);
  Toastify(toastInfo).showToast();
}

const getToast = (string, type, count) => {
  if(type == 'green') {
    (count > 1)
      ? string = `${count} ${string} pokemon found`
      : string = `${string} found`
  } else {
    string = `${string} not found`
  }

  const toast = {
    text: string,
    duration: 3000,
    position: 'center',
    gravity: 'top',
    className: type,
  };

  searcher.latestNotification = toast;

  return toast;
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
      this.verify(string)
    },
    type(string) {
      typeSuccess = false;
      this.verify(string)
    },
    verify(string) {
      const gottaNotify = !(pokeSuccess || typeSuccess);
      (gottaNotify)
        ? showToast(string, 'red')
        : '';
    }
  }
}

const Loading = () => {
  let loading = false;
  let receivedAlerts = 0;
  const logo = document.querySelector('.logo');

  return {
    reset() {
      loading = false;
      receivedAlerts = 0;
    },
    loadingStart() {
      loading = true;
      logo.src = 'https://user-images.githubusercontent.com/68218563/197868253-ea68bd8c-1c41-4b8b-8e72-c32f6af31f57.gif';
    },
    alert() {
      receivedAlerts++;
      this.verify();
    },
    verify() {
      if(receivedAlerts == 2) {
        logo.src = 'https://user-images.githubusercontent.com/68218563/197868213-fea100fe-a347-4038-8629-ad4726344d00.png';
        this.reset();
      }
    }
  }
}

const searcher = new Searcher();
document.querySelector("main").hidden = true;