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

    this.setEvents();
  }

  //Realiza petición a la PokeAPI con la string
  search(string) {
    if (string === "") return;

    //Borra el resultado de la búsqueda anterior
    this.latestResult = [];
    this.cardsContainer.innerHTML = "";

    string = string.toLowerCase();

    const pokemon = this.poke.getPokemon(string);
    const pokemonList = this.poke.getType(string);

    pokemon.then((response) => {
      //console.log(response);
      response ? this.buildLatestResult(response) : "";
    });

    pokemonList.then((response) => {
      //console.log(response);
      response ? this.buildLatestResult(response) : "";
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
    //Caso en que data sea una lista de pokemons
    if (data.pokemon) {
      //console.log(typeof data.pokemon);
      //console.log(data.pokemon[0]);

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
  }

  //Agrega al array el resultado de la búsqueda
  pushLatestResult(pokemon) {
    const card = new Card(pokemon);
    //console.log(pokemon.name, pokemon);

    this.latestResult.push(pokemon);
    this.cardsContainer.innerHTML += card.htmlElement;
  }
}

const searcher = new Searcher();

/*
    función para hacer girar la pokeball
    () => {
        cargando = !cargando;

        (cargando)
            ? logo.src = './assets/img/loading-pokeball.gif'
            : logo.src = './assets/img/pokeball-logo.png';
    }
*/
