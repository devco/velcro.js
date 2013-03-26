ku.utils = {
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

    outerHtml: function(element) {
        var div = document.createElement('div');
        div.appendChild(element);
        return div.innerHTML;
    },

    throwForElement: function(element, message) {
        throw message + "\n" + ku.outerHtml(element);
    },

    isReader: function(name) {
        return name.indexOf('read') === 0;
    },

    isWriter: function(name) {
        return name.indexOf('write') === 0;
    },

    toReader: function(name) {
        return 'read' + name.substring(0, 1).toUpperCase() + name.substring(1);
    },

    toWriter: function(name) {
        return 'write' + name.substring(0, 1).toUpperCase() + name.substring(1);
    },

    fromReader: function(name) {
        return name.substring(4, 5).toLowerCase() + name.substring(5);
    },

    fromWriter: function(name) {
        return name.substring(5, 6).toLowerCase() + name.substring(6);
    },

    isModel: function(fn) {
        return fnCompare(fn, ku.model().toString());
    },

    isCollection: function(fn) {
        return fnCompare(fn, ku.collection().toString());
    }
};