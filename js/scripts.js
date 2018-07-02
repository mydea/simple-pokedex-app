let pokemonRepository = (function() {
  let items = [];
  let apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';

  function addSingle(item) {
    if (validate(item)) {
      items.push(item);
    } else {
      /* eslint-disable no-console */
      console.error('Error when validating item', item);
      /* eslint-enable no-console */
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
    return typeof item === 'object' && item.name;
  }

  function getAll() {
    return items;
  }

  function remove(item) {
    let itemPos = items.indexOf(item);
    if (itemPos > -1) {
      items.splice(itemPos, 1);
    }
  }

  function search(str) {
    str = str.toLowerCase(); // We want to compare lower case strings
    return items.filter(function(item) {
      return item.name.toLowerCase().indexOf(str) > -1;
    });
  }

  function loadList() {
    showLoadingMessage();
    return fetch(apiUrl)
      .then(function(response) {
        // response.ok checks if the status === 200
        if (!response.ok) {
          return Promise.reject('Error loading data'); // This will end in the .catch block
        }
        return response.json();
      })
      .then(function(json) {
        json.results.forEach(function(item) {
          let pokemon = {
            name: item.name,
            detailsUrl: item.url
          };
          add(pokemon);
        });
        hideLoadingMessage();
      })
      .catch(function(e) {
        console.error(e); // eslint-disable-line no-console
        hideLoadingMessage();
      });
  }

  function loadDetails(item) {
    let { detailsUrl: url, imageUrl } = item;

    // If an image is already loaded, we don't need to fetch it again
    // We still want to return a Promise, as otherwise the .then will not work
    if (imageUrl) {
      return Promise.resolve(); // This returns a new Promise that resolves immediately
    }

    showLoadingMessage();
    return fetch(url)
      .then(function(response) {
        if (!response.ok) {
          return Promise.reject('Error loading data'); // This will end in the .catch block
        }
        return response.json();
      })
      .then(function(details) {
        // Now we add the details to the item
        item.imageUrl = details.sprites.front_default;
        hideLoadingMessage();
      })
      .catch(function(e) {
        console.error(e); // eslint-disable-line no-console
        hideLoadingMessage();
      });
  }

  return {
    add,
    getAll,
    remove,
    search,
    loadList,
    loadDetails
  };
})();

function addListItem(item) {
  let container = document.querySelector('.pokemon-list');
  let listItem = document.createElement('li');

  let title = document.createElement('div');
  title.innerText = item.name;
  listItem.appendChild(title);

  container.appendChild(listItem);

  listItem.addEventListener('click', () => {
    showDetails(item, listItem);
  });
}

function showDetails(item, listItem) {
  let listItemDetails = listItem.querySelector('.details');

  // If details already exist, remove them
  if (listItemDetails) {
    listItem.removeChild(listItemDetails);
  } else {
    // Else, first load the details, then add the element
    pokemonRepository.loadDetails(item).then(function() {
      let imageUrl = item.imageUrl;

      listItemDetails = document.createElement('img');
      listItemDetails.setAttribute('src', imageUrl);
      listItemDetails.classList.add('details');
      listItem.appendChild(listItemDetails);
    });
  }
}

function showLoadingMessage() {
  let container = document.querySelector('main');

  let loadingMessage = document.createElement('div');
  loadingMessage.classList.add('loading-message');
  loadingMessage.innerText = 'Loading...';

  container.insertBefore(loadingMessage, container.firstElementChild);
}

function hideLoadingMessage() {
  let loadingMessage = document.querySelector('.loading-message');
  loadingMessage.parentElement.removeChild(loadingMessage);
}

pokemonRepository.loadList().then(function() {
  // Now the data is loaded!
  let allPokemon = pokemonRepository.getAll();
  allPokemon.forEach(function(item) {
    addListItem(item);
  });
});
