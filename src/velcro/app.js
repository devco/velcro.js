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
        // Subscribable values are also extracted and passed in so that accessing them is trivial.
        var binding = new this.options.bindings[name](this, element, parsed.options, parsed.bound);

        if (typeof binding.update === 'function') {
            for (var i in parsed.bound) {
                parsed.bound[i].subscribe(subscriber);
            }
        }

        return this;

        // Returns an object that conains raw, extracted values from the passed in bindings as well as bindable members.
        // Bindable members included any Velcro.value, Velcro.Model and Velcro.Collection.
        function parse() {
            var temp = Velcro.utils.parseBinding(value, context);
            var comp = { options: {}, bound: {} };

            for (var i in temp) {
                if (Velcro.utils.isValue(temp[i])) {
                    comp.options[i] = temp[i]();
                    comp.bound[i]   = temp[i];
                } else if (temp[i] instanceof Velcro.Model || temp[i] instanceof Velcro.Collection) {
                    comp.options[i] = temp[i]._observer();
                    comp.bound[i]   = temp[i]._observer;
                } else {
                    comp.options[i] = temp[i];
                }
            }

            return comp;
        }

        function subscriber() {
            var refreshed = parse();
            binding.update($this, element, refreshed.options, refreshed.bound);
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