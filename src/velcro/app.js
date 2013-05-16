(function() {
    var _bound = [];

    vc.App = vc.Class.extend({
        init: function() {
            this.contexts = [];
        },

        bind: function(element, context) {
            if (context) {
                this.context(context);
            }

            this.bindOne(element);
            this.bindDescendants(element);

            if (context) {
                this.contexts.pop();
            }

            return this;
        },

        bindDescendants: function(parent, context) {
            var $this = this;

            vc.utils.each(parent.childNodes, function(index, element) {
                $this.bind(element, context);
            });

            return this;
        },

        bindOne: function(element) {
            element = vc.dom(element).raw();

            // Do not bind the same element more than once.
            if (_bound.indexOf(element) === -1) {
                _bound.push(element);
            } else {
                return this;
            }

            var bindings = this.getBindingsForElement(element);

            for (var name in bindings) {
                this.applyBinding(element, name, bindings[name], this.context());
            }

            return this;
        },

        getBindingsForElement: function(element) {
            var bindings = {};
            var nodeName = camelCase(element.nodeName);
            var isVcNode = typeof vc.bindings[nodeName] !== 'undefined';
            var nodeValues = [];

            if (element.attributes) {
                for (var a = 0; a < element.attributes.length; a++) {
                    var attr = element.attributes[a];
                    var name = camelCase(attr.nodeName);
                    var value = attr.nodeValue;

                    if (isVcNode) {
                        nodeValues.push(name + ': ' + value);
                    } else if (typeof vc.bindings[name] !== 'undefined') {
                        bindings[name] = value;
                    }
                }
            }

            if (isVcNode) {
                bindings[nodeName] = nodeValues.join(', ');
            }

            return bindings;
        },

        applyBinding: function (element, name, value, context) {
            var $this = this;
            var parsed = this.parseBinding(value, context);
            var binding = vc.bindings[name];

            // Binding must be newable.
            if (typeof binding === 'function') {
                binding = new binding(this, element);
            } else {
                throw 'The binding "' + name + '" must be a constructor.';
            }

            // Initialisation.
            if (typeof binding.init === 'function') {
                binding.init(vc.utils.merge(binding.options, parsed.options), parsed.bound);
            } else if (typeof binding.update === 'function') {
                binding.update(vc.utils.merge(binding.options, parsed.options), parsed.bound);
            }

            // If an update method is provided, subscribe to updates with it.
            if (typeof binding.update === 'function') {
                for (var i in parsed.bound) {
                    parsed.bound[i].subscribe(subscriber);
                }
            }

            return this;

            // Triggers updates within the binding when a observer changes.
            function subscriber() {
                var refreshed = $this.parseBinding(value, context);
                binding.update(vc.utils.merge(binding.options, refreshed.options), refreshed.bound);
            }
        },

        // Returns an object that conains raw, extracted values from the passed in bindings as well as bindable members.
        // Bindable members included any vc.value, vc.Model and vc.Collection.
        parseBinding: function(value, context) {
            var temp = vc.utils.parseBinding(value, context);
            var comp = { options: {}, bound: {} };

            for (var i in temp) {
                if (vc.value.isUnwrapped(temp[i])) {
                    comp.options[i] = temp[i]();

                    if (comp.options[i] instanceof vc.Model || comp.options[i] instanceof vc.Collection) {
                        comp.bound[i] = comp.options[i]._observer;
                    } else {
                        comp.bound[i] = temp[i];
                    }
                } else if (typeof temp[i] === 'function') {
                    comp.options[i] = temp[i].bind(context);
                } else {
                    comp.options[i] = temp[i];
                }
            }

            return comp;
        },

        context: function(context) {
            // Getting.
            if (arguments.length === 0) {
                if (!this.contexts.length) {
                    this.context({});
                }

                return this.contexts[this.contexts.length - 1];
            }

            // We must emulate a context hierarchy.
            if (this.contexts.length) {
                context.$parent = this.contexts[this.contexts.length - 1];
                context.$root   = this.contexts[0];
            } else {
                context.$parent = false;
                context.$root   = false;
            }

            // The youngest descendant in the context hierarchy is the last one in the list.
            this.contexts.push(context);

            return this;
        }
    });

    vc.app = function(element, context) {
        var app = new vc.App();

        if (typeof context === 'undefined') {
            context = element;
            element = document;
        }

        onready(function() {
            app.bind(element, context);
        });

        return app;
    };

    // Thanks Diego Perini!
    function onready(fn) {
        var done = false;
        var top = true;
        var win = window;
        var doc = win.document;
        var root = doc.documentElement;
        var add = doc.addEventListener ? 'addEventListener' : 'attachEvent';
        var rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent';
        var pre = doc.addEventListener ? '' : 'on';

        init = function(e) {
            if (e.type === 'readystatechange' && doc.readyState !== 'complete') {
                return;
            }

            (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);

            if (!done && (done = true)) {
                fn.call(win, e.type || e);
            }
        },

        poll = function() {
            try {
                root.doScroll('left');
            } catch(e) {
                setTimeout(poll, 50); return;
            }

            init('poll');
        };

        if (doc.readyState == 'complete') {
            fn.call(win, 'lazy');
        } else {
            if (doc.createEventObject && root.doScroll) {
                try {
                    top = !win.frameElement;
                } catch(e) {

                }

                if (top) {
                    poll();
                }
            }

            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    }

    function camelCase(dashCase) {
        dashCase = dashCase.toLowerCase();

        if (dashCase.indexOf('-') === -1) {
            return dashCase;
        }

        var parts = dashCase.split('-');

        for (var a = 1; a < parts.length; a++) {
            parts[a] = parts[a].charAt(0).toUpperCase() + parts[a].substring(1);
        }

        return parts.join('');
    }
})();