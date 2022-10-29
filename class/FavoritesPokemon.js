import { showToast } from "./Toast.js";

class FavoritesPokemon {
  constructor() {
    this.favorites = JSON.parse(localStorage.getItem("favoritePokemon")) || [];
  }

  //Agrega o quita un pokemon de la lista de favoritos.
  //Retorna true si se agregó, false si se quitó
  toggleFavorite(pokemon) {
    let pokeStatus = this.isFavorite(pokemon);
    pokeStatus ? this.remove(pokemon) : this.add(pokemon);

    this.updateLocalStorage();

    return !pokeStatus;
  }

  add({ name, id }) {
    this.favorites.push(id);

    showToast({
      text: `${name} added to favorites`,
      duration: 3000,
      position: "center",
      gravity: "bottom",
      className: "yellow",
    });
  }

  remove({ name, id }) {
    const index = this.favorites.indexOf(id);
    this.favorites.splice(index, 1);

    showToast({
      text: `${name} removed from favorites`,
      duration: 3000,
      position: "center",
      gravity: "bottom",
      className: "red",
    });
  }

  updateLocalStorage() {
    const localData = JSON.stringify(this.favorites);
    localStorage.setItem("favoritePokemon", localData);
  }

  isFavorite(pokemon) {
    return this.favorites.includes(pokemon.id);
  }
}

export default FavoritesPokemon;
