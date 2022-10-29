import FavoritesPokemon from "./FavoritesPokemon.js";

class FullscreenView {
  constructor(pokemon) {
    this.pokemon = pokemon;
    this.favoriteButton = this.getFavoriteButton();
    this.html = this.buildHTML();
    this.favoritePokemon = new FavoritesPokemon();
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
    const fullview = document.createElement("div");
    fullview.classList.add("card");
    fullview.classList.add("fullview");

    const innerHTML = `
        <figure style="background-image: url('${
          this.pokemon.frontSprite
        }')"></figure>
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
    this.pokemon.toggleFavorite();
    this.updateFavoriteBackground();
    const pokeStatus = this.favoritePokemon.toggleFavorite(this.pokemon);

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
    const background = this.pokemon.favorite
      ? "https://user-images.githubusercontent.com/68218563/198399898-2aa28e32-a2bf-4be5-9d6c-95c74550275d.png"
      : "https://user-images.githubusercontent.com/68218563/198399927-0de6b962-8dc8-404b-ad84-6d3b47ad4a5c.png";

    return background;
  }
}

export default FullscreenView;
