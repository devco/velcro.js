(function() {
    var _bound = [];

    vc.App = function() {
        this.contexts = [];
    };

    vc.App.prototype = {
        bind: function(element, context) {
            if (arguments.length === 1) {
                context = element;
                element = document;
            }

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
            var $this = this;

            element = vc.dom(element).raw();

            // Do not bind the same element more than once.
            if (_bound.indexOf(element) === -1) {
                _bound.push(element);
            } else {
                return this;
            }

            vc.utils.each(element.attributes, function(i, node) {
                // An element may have been altered inside of a binding, therefore
                // we must check if the binding still exists.
                if (typeof element.attributes[i] === 'undefined') {
                    return;
                }

                // Bindings must be data- attributes.
                if (node.nodeName.indexOf('data-') === -1) {
                    return;
                }

                // A namespace is in the format of "data-[namespace]-[bindingName]".
                var binding = node.nodeName.match(/^data-([^\-]+)-(.+)/);

                // If there isn't a namespaced binding continue.
                if (!binding) {
                    return;
                }

                // Binding namespace and binding must be registered.
                if (typeof vc.bindings[binding[1]] === 'undefined' || typeof vc.bindings[binding[1]][binding[2]] === 'undefined') {
                    return;
                }

                $this.bindAttribute(element, binding[1], binding[2], node.nodeValue);
            });

            return this;
        },

        bindAttribute: function (element, namespace, binding, value) {
            // The context is saved so that if it changes it won't mess up a subscriber.
            var context = this.context();

            // Contains parsed information for the initial updates.
            var parsed = parse();

            // This will initialise the binding and do any initial changes to the bound elements.
            // Subscribable values are also extracted and passed in so that accessing them is trivial.
            var inst = vc.bindings[namespace][binding];

            // Binding must be newable.
            if (typeof inst === 'function') {
                inst = new inst(this, element);
            } else {
                throw 'The binding "' + binding + '" must be a function.';
            }

            // Initialisation.
            if (typeof inst.init === 'function') {
                inst.init(vc.utils.merge(inst.options, parsed.options), parsed.bound);
            } else if (typeof inst.update === 'function') {
                inst.update(vc.utils.merge(inst.options, parsed.options), parsed.bound);
            }

            // If an update method is provided, subscribe to updates with it.
            if (typeof inst.update === 'function') {
                for (var i in parsed.bound) {
                    parsed.bound[i].subscribe(subscriber);
                }
            }

            return this;

            // Returns an object that conains raw, extracted values from the passed in bindings as well as bindable members.
            // Bindable members included any vc.value, vc.Model and vc.Collection.
            function parse() {
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
            }

            // Triggers updates within the binding when a observer changes.
            function subscriber() {
                var refreshed = parse();
                inst.update(vc.utils.merge(inst.options, refreshed.options), refreshed.bound);
            }
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
    };

    vc.app = function(element, model) {
        return new vc.App().bind(element, model);
    };
})();