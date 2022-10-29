import FullscreenView from "./FullscreenView.js";

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
            <figure class="pokesprite" style="background-image: url('${
              pokemon.frontSprite
            }')"></figure>
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

export default Card;
