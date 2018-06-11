var pokemonRepository = (function () {
    var items = [];

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
        return typeof item === 'object' && item.name;
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

    return {
        add: add,
        getAll: getAll,
        remove: remove,
        search: search
    };
})();
