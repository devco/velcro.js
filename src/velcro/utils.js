(function() {
    velcro.utils = {
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

        isArray: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

        isClass: function(obj) {
            return typeof obj === 'function' && typeof obj.extend === 'function' && obj.extend === velcro.Class.extend;
        },

        isInstance: function(obj) {
            return obj && typeof obj.constructor === 'function';
        },

        isObject: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Object]';
        },

        isValue: function(value) {
            return typeof value === 'function' && value.toString() === velcro.value().toString();
        },

        merge: function() {
            var merged = {};

            for (var i = 0; i < arguments.length; i++) {
                var param = arguments[i];

                if (!velcro.utils.isObject(param)) {
                    continue;
                }

                for (var ii in param) {
                    var value = param[ii];

                    if (velcro.utils.isObject(value)) {
                        if (typeof merged[ii] === 'undefined' || velcro.utils.isInstance(value)) {
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

            for (var i in context) {
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
            if (typeof JSON === 'undeinfed' || typeof JSON.parse !== 'function') {
                throw 'Unable to parse JSON string "' + json + '" because no JSON parser is available via JSON.parse().';
            }

            try {
                return JSON.parse(json);
            } catch (error) {
                throw 'Error parsing response "' + response + '" with message "' + error + '".';
            }
        },

        extract: function(obj) {
            var options = {};

            velcro.utils.each(obj, function(name, value) {
                if (velcro.utils.isValue(value)) {
                    options[name] = value();
                } else {
                    options[name] = value;
                }
            });

            return options;
        },

        throwForElement: function(element, message) {
            throw message + "\n" + velcro.dom(element).html();
        }
    };
})();