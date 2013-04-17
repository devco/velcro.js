(function() {
    velcro.utils = {
        setAttribute: function(element, name, value) {
            if (element.setAttribute) {
                element.setAttribute(name, value);
            } else {
                element[name] = value;
            }
        },

        getAttribute: function(element, name) {
            if (element.getAttribute) {
                return element.getAttribute(name);
            }

            if (typeof element[name] === 'undefined') {
                return false;
            }

            return element[name];
        },

        addEvent: function(element, event, callback) {
            if (element.addEventListener) {
                element.addEventListener(event, proxy, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + event, function(e) {
                    proxy.call(element, e);
                });
            } else {
                element['on' + event] = proxy;
            }

            // Proxies the call to the callback to modify the event object before it
            // passed to the callback so that common functionality can be abstracted.
            function proxy(e) {
                if (!e.preventDefault) {
                    e.preventDefault = function() {
                        e.returnValue = false;
                        return e;
                    };
                }

                if (!e.stopPropagation) {
                    e.stopPropagation = function() {
                        e.cancelBubble = true;
                        return e;
                    };
                }

                if (callback(e) === false) {
                    e.preventDefault();
                }
            }
        },

        createElement: function(html) {
            var tag = html.match(/^<([^\s>]+)/)[1];
            var div = document.createElement(detectParentTagName(tag));
            div.innerHTML = html;
            var element = div.childNodes[0];
            div.removeChild(element);
            return element;
        },

        destroyElement: function(element) {
            element.parentNode.removeChild(element);
            element.innerHTML = '';
            delete element.attributes;
            delete element.childNodes;
        },

        replaceElement: function(reference, replacement) {
            reference.parentNode.insertBefore(replacement, reference);
            reference.parentNode.removeChild(reference);
        },

        elementIndex: function(element) {
            for (var i = 0; i < element.parentNode.childNodes; i++) {
                if (element === element.parentNode.childNodes[i]) {
                    return i;
                }
            }

            return false;
        },

        html: function(element) {
            var div = document.createElement(detectParentTagName(element.tagName));
            div.appendChild(element.cloneNode(true));
            return div.innerHTML;
        },

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
            throw message + "\n" + velcro.html(element);
        }
    };

    function detectParentTagName(tag) {
        var map = {
            colgroup: 'table',
            col: 'colgroup',
            caption: 'table',
            thead: 'table',
            tbody: 'table',
            tfoot: 'table',
            tr: 'tbody',
            th: 'thead',
            td: 'tr'
        };

        tag = tag.toLowerCase();

        if (typeof map[tag] !== 'undefined') {
            return map[tag];
        }

        return 'div';
    }
})();