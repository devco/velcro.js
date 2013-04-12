Velcro.App = function(options) {
    this.options = Velcro.utils.merge({
        attributePrefix: 'data-vc-',
        bindings: Velcro.defaultBindings
    }, options);

    this.contexts = [];
};

Velcro.App.prototype = {
    bind: function(element, context) {
        if (arguments.length === 1) {
            context = element;
            element = document;
        }

        this.context(context);
        this.bindOne(element);
        this.bindDescendants(element);
        this.restoreContext();

        return this;
    },

    bindDescendants: function(parent, context) {
        var $this   = this;

        if (arguments.length === 1) {
            context = this.context();
        }

        Velcro.utils.each(parent.childNodes, function(index, element) {
            $this.bind(element, context);
        });

        return this;
    },

    bindOne: function(element) {
        var $this = this;

        Velcro.utils.each(element.attributes, function(i, node) {
            // an element may have been altered inside of a binding, therefore
            // we must check if the binding still exists
            if (typeof element.attributes[i] === 'undefined') {
                return;
            }

            var name = node.nodeName.substring($this.options.attributePrefix.length);

            if (typeof $this.options.bindings[name] === 'function') {
                $this.bindAttribute(element, name, node.nodeValue);
            }
        });

        return this;
    },

    bindAttribute: function (element, name, value) {
        var $this   = this;
        var parsed  = Velcro.utils.parseBinding(value, this.context());
        var binding = new this.options.bindings[name](this, element, extractObservableValues());

        Velcro.utils.each(parsed, function(parsedName, parsedValue) {
            if (Velcro.utils.isValue(parsedValue)) {
                parsedValue.subscribe(subscriber);
            }

            if (parsedValue instanceof Velcro.Model || parsedValue instanceof Velcro.Collection) {
                parsedValue.$observer.subscribe(subscriber);
            }
        });

        return this;

        function subscriber() {
            if (typeof binding.update === 'function') {
                binding.update($this, element, extractObservableValues());
            }
        }

        function extractObservableValues() {
            var options = {};

            Velcro.utils.each(parsed, function(name, value) {
                if (Velcro.utils.isValue(value)) {
                    options[name] = value();
                } else {
                    options[name] = value;
                }
            });

            return options;
        }
    },

    context: function(context) {
        if (typeof context === 'object') {
            if (this.contexts.length) {
                context.$parent = this.contexts[this.contexts.length - 1];
                context.$root   = this.contexts[0];
            }

            this.contexts.push(context);

            return this;
        } else {
            return this.contexts.length ? this.contexts[this.contexts.length - 1] : false;
        }
    },

    restoreContext: function() {
        this.contexts.pop();
        return this;
    }
};