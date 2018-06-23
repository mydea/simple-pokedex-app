'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var pokemonRepository = function () {
    var items = [];
    var apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';

    function addSingle(item) {
        if (validate(item)) {
            items.push(item);
        } else {
            console.error('Error when validating item', item);
        }
    }

    function add(item) {
        if (Array.isArray(item)) {
            items.forEach(addSingle);
        } else {
            addSingle(item);
        }
    }

    function validate(item) {
        return (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && item.name;
    }

    function getAll() {
        return items;
    }

    function remove(item) {
        var itemPos = items.indexOf(item);
        if (itemPos > -1) {
            items.splice(itemPos, 1);
        }
    }

    function search(str) {
        str = str.toLowerCase(); // We want to compare lower case strings
        return items.filter(function (item) {
            return item.name.toLowerCase().indexOf(str) > -1;
        });
    }

    function loadList() {
        showLoadingMessage();
        return fetch(apiUrl).then(function (response) {
            // response.ok checks if the status === 200
            if (!response.ok) {
                return Promise.reject('Error loading data'); // This will end in the .catch block
            }
            return response.json();
        }).then(function (json) {
            json.results.forEach(function (item) {
                var pokemon = {
                    name: item.name,
                    detailsUrl: item.url
                };
                add(pokemon);
            });
            hideLoadingMessage();
        }).catch(function (e) {
            console.error(e);
            hideLoadingMessage();
        });
    }

    function loadDetails(item) {
        var url = item.detailsUrl,
            imageUrl = item.imageUrl;

        // If an image is already loaded, we don't need to fetch it again
        // We still want to return a Promise, as otherwise the .then will not work

        if (imageUrl) {
            return Promise.resolve(); // This returns a new Promise that resolves immediately
        }

        showLoadingMessage();
        return fetch(url).then(function (response) {
            if (!response.ok) {
                return Promise.reject('Error loading data'); // This will end in the .catch block
            }
            return response.json();
        }).then(function (details) {
            // Now we add the details to the item
            item.imageUrl = details.sprites.front_default;
            hideLoadingMessage();
        }).catch(function (e) {
            console.error(e);
            hideLoadingMessage();
        });
    }

    return {
        add: add,
        getAll: getAll,
        remove: remove,
        search: search,
        loadList: loadList,
        loadDetails: loadDetails
    };
}();

function addListItem(item) {
    var container = document.querySelector('.pokemon-list');
    var listItem = document.createElement('li');

    var title = document.createElement('div');
    title.innerText = item.name;
    listItem.appendChild(title);

    container.appendChild(listItem);

    listItem.addEventListener('click', function () {
        showDetails(item, listItem);
    });
}

function showDetails(item, listItem) {
    var listItemDetails = listItem.querySelector('.details');

    // If details already exist, remove them
    if (listItemDetails) {
        listItem.removeChild(listItemDetails);
    } else {
        // Else, first load the details, then add the element
        pokemonRepository.loadDetails(item).then(function () {
            var imageUrl = item.imageUrl;

            listItemDetails = document.createElement('img');
            listItemDetails.setAttribute('src', imageUrl);
            listItemDetails.classList.add('details');
            listItem.appendChild(listItemDetails);
        });
    }
}

function showLoadingMessage() {
    var container = document.querySelector('main');

    var loadingMessage = document.createElement('div');
    loadingMessage.classList.add('loading-message');
    loadingMessage.innerText = 'Loading...';

    container.insertBefore(loadingMessage, container.firstElementChild);
}

function hideLoadingMessage() {
    var loadingMessage = document.querySelector('.loading-message');
    loadingMessage.parentElement.removeChild(loadingMessage);
}

pokemonRepository.loadList().then(function () {
    // Now the data is loaded!
    var allPokemon = pokemonRepository.getAll();
    allPokemon.forEach(function (item) {
        addListItem(item);
    });
});