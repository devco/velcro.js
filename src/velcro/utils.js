Velcro.utils = {
    each: function(items, fn) {
        items = items || [];

        if (typeof items === 'string') {
            items = [items];
        }

        if (typeof items.length === 'number') {
            for (var i = 0; i < items.length; i++) {
                if (fn(i, items[i]) === false) {
                    return;
                }
            }
        } else {
            for (var x in items) {
                if (fn(x, items[x]) === false) {
                    return;
                }
            }
        }
    },

    element: function(html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        var element = div.childNodes[0];
        div.removeChild(element);
        return element;
    },

    fnCompare: function(fn, str) {
        if (!fn) {
            return false;
        }

        if (typeof fn === 'object' && fn.constructor) {
            fn = fn.constructor;
        }

        if (typeof fn === 'function') {
            fn = fn.toString();
        }

        return fn === str;
    },

    html: function(element) {
        var div = document.createElement('div');
        div.appendChild(element.cloneNode(true));
        return div.innerHTML;
    },

    isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },

    isClass: function(obj) {
        return typeof obj === 'function' && typeof obj.extend === 'function' && obj.extend === Velcro.Class.extend;
    },

    isInstance: function(obj) {
        return obj && typeof obj.constructor === 'function';
    },

    isObject: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    },

    isValue: function(value) {
        return typeof value === 'function' && value.toString() === Velcro.value().toString();
    },

    merge: function() {
        var merged = {};

        for (var i = 0; i < arguments.length; i++) {
            var param = arguments[i];

            if (!Velcro.utils.isObject(param)) {
                continue;
            }

            for (var ii in param) {
                var value = param[ii];

                if (Velcro.utils.isObject(value)) {
                    if (typeof merged[ii] === 'undefined' || Velcro.utils.isInstance(value)) {
                        merged[ii] = value;
                    } else {
                        merged[ii] = Velcro.utils.merge(merged[ii], value);
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
    },

    throwForElement: function(element, message) {
        throw message + "\n" + Velcro.html(element);
    }
};