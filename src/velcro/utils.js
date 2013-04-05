velcro.utils = {
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
    },

    isObject: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    },

    isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },

    merge: function() {
        var merged  = arguments[0];
        var params = Array.prototype.slice.call(arguments, 1);

        for (var i = 0; i < params.length; i++) {
            var param = params[i];

            if (!velcro.utils.isObject(param)) {
                continue;
            }

            for (var ii in param) {
                var value = param[ii];

                if (velcro.utils.isObject(value)) {
                    if (typeof merged[ii] === 'undefined') {
                        merged[ii] = value;
                    } else {
                        merged[ii] = velcro.utils.merge(merged[ii], value);
                    }
                } else {
                    merged[ii] = value;
                }
            }
        }

        return merged;
    },

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

    parseJson: function(json) {
        try {
            return JSON.parse(json);
        } catch (error) {
            throw 'Error parsing response "' + response + '" with message "' + error + '".';
        }
    }
};