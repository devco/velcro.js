velcro.utils = {
    parseBinding: function(json, context) {
        var code = '';

        for (var i in context || {}) {
            if (i === 'import' || i === 'export' || i === '') {
                continue;
            }

            code += 'var ' + i + '=__context[\'' + i + '\'];';
        }

        code += 'return {' + json + '};';

        try {
            return new Function('__context', code)(context);
        } catch (e) {
            throw 'Error parsing binding "' + json + '" with message: "' + e + '"';
        }
    },

    isObservable: function(value) {
        return typeof value === 'function' && value.toString() === velcro.value().toString();
    },

    html: function(element) {
        var div = document.createElement('div');
        div.appendChild(element);
        return div.innerHTML;
    },

    throwForElement: function(element, message) {
        throw message + "\n" + velcro.html(element);
    },

    isModel: function(fn) {
        return fnCompare(fn, velcro.model().toString());
    },

    isCollection: function(fn) {
        return fnCompare(fn, velcro.collection().toString());
    }
};