import FavoritesPokemon from "./FavoritesPokemon.js";
import pokeApi from "./pokeApi.js";
import Pokemon from "./Pokemon.js";

class FullscreenView {
  constructor(pokemon) {
    this.pokemon = pokemon;
    this.favoriteButton = this.getFavoriteButton();
    this.html = this.buildHTML();
    this.favoritePokemon = new FavoritesPokemon();
    this.setEvolutions();
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
    const fullviewCard = document.createElement("div");
    fullviewCard.classList.add("card");
    fullviewCard.classList.add("fullview");

    const innerHTML = `
        <figure class="fullview-sprite" style="background-image: url('${
          this.pokemon.frontSprite
        }')"></figure>
        <h2 class="pokemon-name">${this.pokemon.getName()}</h2>
        <span class="pokemon-id">${this.pokemon.id}</span>
        <div class="favorite-button"></div>
  
        <div class="pokemon-stats">
          <p class="poke-stat height">Height: ${this.pokemon.height}cm</p>
          <p class="poke-stat weight">Weight: ${this.pokemon.weight}Kg</p>
        </div>

        <section class="evolution-container"><section>
      `;

    fullviewCard.innerHTML = innerHTML;
    fullviewCard.appendChild(this.getCloseButton());
    fullviewCard.appendChild(this.favoriteButton);

    return fullviewCard;
  }

  //Retorna el boton para cerrar la fullscreenView
  getCloseButton() {
    const closeButton = document.createElement("button");
    closeButton.classList.add("close-button");
    closeButton.innerHTML = "X";

    const buttonHitBox = document.createElement("div");
    buttonHitBox.classList.add("hitbox");

    closeButton.appendChild(buttonHitBox);

    buttonHitBox.addEventListener("click", () => {
      closeButton.parentElement.parentElement.remove();
    });

    return closeButton;
  }

  //retorna elemento botón para añadir a favoritos
  getFavoriteButton() {
    const favoriteButton = document.createElement("div");
    favoriteButton.classList.add("favorite-button");

    this.updateFavoriteBackground(favoriteButton);

    favoriteButton.addEventListener(
      "click",
      this.favoriteButtonClick.bind(this)
    );

    return favoriteButton;
  }

  //Funcion que se ejecutará en el evento click del favoriteButton
  favoriteButtonClick() {
    this.favoritePokemon.toggleFavorite(this.pokemon);
    this.updateFavoriteBackground();

    new Audio(
      "https://soundboardguy.com/wp-content/uploads/2021/05/pokemon-a-button.mp3"
    ).play();
  }

  //Actualiza el fondo del botón favoritos
  updateFavoriteBackground(favoriteButton = this.favoriteButton) {
    const background = this.getFavoriteBackground();
    favoriteButton.innerHTML = `<figure style="background-image: url('${background}')">`;
  }

  //Retorna el fondo correspondiente en función de this.favorite
  getFavoriteBackground() {
    const background = this.pokemon.isFavorite()
      ? "https://user-images.githubusercontent.com/68218563/198399898-2aa28e32-a2bf-4be5-9d6c-95c74550275d.png"
      : "https://user-images.githubusercontent.com/68218563/198399927-0de6b962-8dc8-404b-ad84-6d3b47ad4a5c.png";

    return background;
  }

  //retorna un array con la chain evolution del pokemon
  async getEvolutionChain() {
    const pokeapi = new pokeApi();
    const nameArray = await pokeapi.getEvolutionChain(this.pokemon);

    if (!nameArray) return false;

    let pokemonArray = [];

    for (let name of nameArray) {
      const pokemon = await pokeapi.getPokemon(name);
      pokemonArray.push(pokemon);
    }

    return pokemonArray;
  }

  //Crea el contender de evoluciones y la añade a la vista fullscreen
  setEvolutions() {
    const pokemonChain = this.getEvolutionChain();

    pokemonChain.then((response) => {
      this.evolutionContainer = document.querySelector(".evolution-container");

      if (!response) {
        this.addEvolution(this.pokemon, this.evolutionContainer);
        return;
      }

      for (let pokemon of response) {
        const pokeInfo = new Pokemon(pokemon);
        this.addEvolution(pokeInfo, this.evolutionContainer);
      }
    });
  }

  //Agrega una evolución al contenedor
  addEvolution(pokemon, container) {
    const pokemonDiv = this.createEvolutionDiv(pokemon);
    pokemonDiv.innerHTML = this.getEvolutionContent(pokemon);
    container.appendChild(pokemonDiv);
  }

  //Crea el div que contiene a la evolucion
  createEvolutionDiv(pokemon) {
    const evolution = document.createElement("div");
    evolution.classList.add("evolution");

    evolution.addEventListener("click", () => {
      this.pokemon = pokemon;
      this.updateFavoriteBackground();

      const sprite = document.querySelector(".fullview-sprite");
      const pokemonName = document.querySelector(".fullview .pokemon-name");
      const pokemonId = document.querySelector(".fullview .pokemon-id");
      const height = document.querySelector(".fullview .height");
      const weight = document.querySelector(".fullview .weight");

      sprite.style.backgroundImage = `url(${this.pokemon.frontSprite})`;
      pokemonName.innerHTML = this.pokemon.getName();
      pokemonId.innerHTML = this.pokemon.id;
      height.innerHTML = `Height: ${this.pokemon.height}cm`;
      weight.innerHTML = `Weight: ${this.pokemon.weight}Kg`;
    });

    return evolution;
  }

  //Retorna el html interno del div de la evolucion
  getEvolutionContent(pokemon) {
    const typeElement = pokemon.typesToSpan();

    const htmlContent = `
      <figure class="pokesprite" style="background-image: url('${
        pokemon.frontSprite
      }')"></figure>
      <h4>${pokemon.getName()}<h4>
      ${typeElement}
    `;

    return htmlContent;
  }
}

export default FullscreenView;
