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

  //Recibe el id de un pokemon, retorna la informacion de specie
  async getPokemonSpecies(id) {
    const request = `${pokeApi}pokemon-species/${id}/`;
    const data = await getData(request);
    return data;
  }

  //Retorna informacion de la cadena de evolucion de un pokemon
  async requestEvolutionChain(id) {
    const pokemonSpecie = await this.getPokemonSpecies(id);
    const request = pokemonSpecie.evolution_chain.url;

    const data = await getData(request);

    return data;
  }

  //retorna un array de los id de la cadena de evolucion de un pokemon
  async getEvolutionChain({ id }) {
    const evolutionChain = await this.requestEvolutionChain(id);
    const evolutionArray = getDataFromChain(evolutionChain);

    console.log(evolutionArray);
  }
}

//Transforma el object de la cadena a un array de ids
const getDataFromChain = (evolutionChain) => {
  let evolutionArray = [];
  let chain = evolutionChain.chain;

  evolutionArray.push(chain.species.name);
  chain = chain.evolves_to;

  let nextEvolution = chain.length > 0;

  if (nextEvolution)
    evolutionArray = [...evolutionArray, ...getEvolutions(chain)];

  return evolutionArray;
};

const getEvolutions = (chain) => {
  let evolutionArray = [];

  for (let evolution of chain) {
    evolutionArray.push(evolution.species.name);
    const currentPokemonChain = getEvolutions(evolution.evolves_to);

    if (currentPokemonChain)
      evolutionArray = [...evolutionArray, ...currentPokemonChain];
  }
  return evolutionArray;
};

export default PokeApi;
