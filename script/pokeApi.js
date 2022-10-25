class PokeApi {
    constructor() {
        this.pokeURL = 'https://pokeapi.co/api/v2/';    
    }

    //Recibe una url para hacer una petición, retorna un objeto
    async getData(url) {
        try {
            const response = await fetch(this.pokeURL + url);
            const data = response.ok && await response.json();

            return data;
        } catch (err) {
            console.error('💀ERROR ', err);
        }
    }

    //Recibe el nombre de un pokemon, retorna un objeto.
    async getPokemon(pokemonName) {
        const url = 'pokemon/' + pokemonName;
        
        const pokemon = await this.getData(url);
        
        return pokemon;
    }
    
    //Recibe el nombre de un tipo, retorna un array con los pokemon del tipo escogido
    async getType(typeName) {
        const url = 'type/' + typeName;
        const pokemonList = await this.getData(url);
    
        return pokemonList;
    }
}

export default PokeApi;