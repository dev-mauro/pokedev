import FavoritesPokemon from "./FavoritesPokemon.js";

class Pokemon {
  constructor(info) {
    this.name = info.name;
    this.id = info.id;
    this.weight = info.weight / 10;
    this.height = info.height * 10;

    this.types = this.getTypesArray(info);

    let unknownSprite =
      "https://user-images.githubusercontent.com/68218563/197868839-9f80d72b-f65c-47af-8604-d4d2bfaba65b.png";

    this.frontSprite = info.sprites.front_default || unknownSprite;
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

  isFavorite() {
    const favoritePokemon = new FavoritesPokemon();
    return favoritePokemon.isFavorite(this);
  }
}

export default Pokemon;
