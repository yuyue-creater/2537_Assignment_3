let pokemon = []
let pokemonTypes = []
let totalPokemons = []

const PAGE_SIZE = 10;
var numPages = 0;

const getPokemonTypes = async () => {
    const result = await axios.get('https://pokeapi.co/api/v2/type')
    return result.data.results
}

const displayPokemonTypes = (types) => {
    types.forEach((type) => {
        $('#pokemonTypes').append(`
          <span>
              <input type="checkbox" class="form-check-input pokemonTypes" id="${type.name}" value="${type.name}">
              <label class="form-check-label" for="${type.name}">${type.name.charAt(0).toUpperCase()}${type.name.slice(1)}</label>
          </span>
      `)
    })
}

const getPokemons = async () => {
    const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=810')
    let pokemonsResult = res.data.results
    pokemonsResult.forEach(async (pokemon) => {
        const res = await axios.get(pokemon.url)
        let pokemonTypes = []
        res.data.types.forEach((type) => {
            pokemonTypes.push(type.type.name)
        })
        pokemon.types = pokemonTypes
    })
    return pokemonsResult
}

const loadPokemon = async () => {
    const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=810')
    let pokemons = res.data.results
    pokemons.forEach(async (pokemon) => {
        const res = await axios.get(pokemon.url)
        let pokemonTypes = []
        res.data.types.forEach((type) => {
            pokemonTypes.push(type.type.name)
        })
        pokemon.types = pokemonTypes
    })
    return pokemons
}

const setup = async () => {
    pokemonTypes = await getPokemonTypes()
    displayPokemonTypes(pokemonTypes)


    // test out poke api using axios here
    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
    pokemon = response.data.results;
    console.log(typeof pokemon)
    totalPokemons = await getPokemons()
    console.log(typeof totalPokemons)
    numPages = Math.ceil(totalPokemons.length / 10)
    console.log('pokemon length', pokemon.length)
    showPage(1, pokemon);


    $('body').on('click', '.pokemonTypes', async function () {
        let selectedTypes = []
        $('.pokemonTypes').each(function () {
            if ($(this).is(':checked')) {
                selectedTypes.push($(this).val())
            }
        })
        if (selectedTypes.length == 1) {
            let selected_pokemons = []
            totalPokemons.forEach((pokemon) => {


                if (pokemon.types.includes(selectedTypes[0])) {
                    selected_pokemons.push(pokemon)
                    console.log(selected_pokemons.length)
                }
            })
            pokemon = selected_pokemons
        }
        else if (selectedTypes.length == 2) {
            let selected_pokemons = []
            totalPokemons.forEach((pokemon) => {
                if (pokemon.types.includes(selectedTypes[0]) && pokemon.types.includes(selectedTypes[1])) {
                    selected_pokemons.push(pokemon)
                }
            })
            pokemon = selected_pokemons
        }
        else if (selectedTypes.length > 2) {
            pokemon = []
        }
        else {
            pokemon = totalPokemons
        }
        showPage(1, pokemon)
    })

    // pop up modal when clicking on a pokemon card
    // add event listener to each pokemon card
    $('body').on('click', '.pokeCard', async function (e) {
        const pokemonName = $(this).attr('pokeName')
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        const types = res.data.types.map((type) => type.type.name)
        $('.modal-body').html(`
            <div style="width:200px">
                <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
                <div>
                    <h3>Abilities</h3>
                    <ul>${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}</ul>
                </div>
                <div>
                    <h3>Stats</h3>
                    <ul>${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}</ul>
                </div>
            </div>
            <h3>Types</h3>
            <ul>${types.map((type) => `<li>${type}</li>`).join('')}</ul>
          `)
        $(".modal-title").html(`<h2>${res.data.name}</h2>`)
    })

    $('body').on('click', '.pageBtn', async function (e) {
        const pageNum = parseInt($(this).attr('pageNum'))
        console.log("parseint", $(this).attr('pageNum'))
        console.log("pageNum: ", pageNum);
        showPage(pageNum, pokemon);
    });
};


async function showPage(currentPage, pokemon) {

    if (currentPage < 1) {
        currentPage = 1;
    }
    if (currentPage > numPages) {
        currentPage = numPages;
    }

    $('#pokemon').empty();
    for (let i = ((currentPage - 1) * PAGE_SIZE); i < ((currentPage - 1) * PAGE_SIZE) + PAGE_SIZE && i < pokemon.length; i++) {
        let innerResponse = await axios.get(`${pokemon[i].url}`);
        let thisPokemon = innerResponse.data;

        $('#pokemon').append(`
        <div class="pokeCard card" pokeName=${thisPokemon.name}>
            <h3>${thisPokemon.name}</h3>
            <img src="${thisPokemon.sprites.front_default}" alt="${thisPokemon.name}"/>
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">More</button>
        </div>
    `);
    }

    // add pagination buttons
    $('#pagination').empty();
   
    numPages = Math.ceil(pokemon.length / PAGE_SIZE)
    const startI = currentPage - 2 > 0 ? currentPage - 2 : 1;
    const endI = currentPage + 2 < numPages ? currentPage + 2 : numPages;


    if (pokemon.length < PAGE_SIZE) {
        $('#pagination').append(`
            <button class="btn btn-primary pageBtn active" value="1">1</button>`)
    } else {

        if (currentPage > 1) {
            $('#pagination').append(`
          <button class="btn btn-primary pageBtn" pageNum="${currentPage - 1}">Previous</button>
      `)
        }

        for (let i = startI; i <= endI; i++) {
            if (i == currentPage) {
                $('#pagination').append(`<button class="btn btn-primary pageBtn active" pageNum="${i}">${i}</button>`)
            } else {
                $('#pagination').append(`<button class="btn btn-primary pageBtn" pageNum="${i}">${i}</button>`)
            }
        }

        if (10*(currentPage) < pokemon.length) {
            $('#pagination').append(`
        <button class="btn btn-primary pageBtn" pageNum="${currentPage + 1}">Next</button>
    `)
        }
    }
    $('#numberPokemons').empty()
    let size = PAGE_SIZE
    if (pokemon.length < PAGE_SIZE) {
        size = pokemon.length
    } else if (currentPage * 10 > pokemon.length) {
        size = pokemon.length - (currentPage-1)*10
    }
    $('#numberPokemons').html(`<h3>Showing ${size} of ${pokemon.length} Pokemons</h3>`)
}

$(document).ready(setup)



