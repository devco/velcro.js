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
        var $this = this;

        // The context is saved so that if it changes it won't mess up a subscriber.
        var context = this.context();

        // Contains parsed information for the initial updates.
        var parsed = parse();

        // This will initialise the binding and do any initial changes to the bound elements.
        var binding = new this.options.bindings[name](this, element, Velcro.utils.extract(parsed));

        if (typeof binding.update === 'function') {
            // We subscribe to anything that can publish updates in the original parsed value.
            for (var i in parsed) {
                if (Velcro.utils.isValue(parsed[i])) {
                    parsed[i].subscribe(subscriber);
                } else if (parsed[i] instanceof Velcro.Model || parsed[i] instanceof Velcro.Collection) {
                    parsed[i]._observer.subscribe(subscriber);
                }
            }
        }

        return this;

        function parse() {
            return Velcro.utils.parseBinding(value, context);
        }

        function subscriber() {
            // Bindings are re-parsed for every subscriber so that no stale data is bound.
            binding.update($this, element, Velcro.utils.extract(parse()));
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