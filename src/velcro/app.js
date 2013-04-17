velcro.App = function(options) {
    this.options = velcro.utils.merge({
        attributePrefix: 'data-vc-',
        bindings: velcro.defaultBindings
    }, options);

    this.contexts = [];
};

velcro.App.prototype = {
    bind: function(element, context) {
        if (arguments.length === 1) {
            context = element;
            element = document;
        }

        if (context) {
            this.setContext(context);
        }

        this.bindOne(element);
        this.bindDescendants(element);

        if (context) {
            this.restoreContext();
        }

        return this;
    },

    bindDescendants: function(parent, context) {
        var $this = this;

        velcro.utils.each(parent.childNodes, function(index, element) {
            $this.bind(element, context);
        });

        return this;
    },

    bindOne: function(element) {
        var $this = this;

        velcro.utils.each(element.attributes, function(i, node) {
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
        var context = this.getContext();

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
        // Bindable members included any velcro.value, velcro.Model and velcro.Collection.
        function parse() {
            var temp = velcro.utils.parseBinding(value, context);
            var comp = { options: {}, bound: {} };

            for (var i in temp) {
                if (velcro.utils.isValue(temp[i])) {
                    comp.options[i] = temp[i]();
                    comp.bound[i]   = temp[i];
                } else if (temp[i] instanceof velcro.Model || temp[i] instanceof velcro.Collection) {
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

    setContext: function(context) {
        // All contexts have a $bindings special property for bindings to apply their data to if necessary.
        context.$bindings = {};

        // If bindings exist we must emulate a hierarchy.
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
    },

    getContext: function() {
        if (!this.contexts.length) {
            this.setContext({});
        }

        return this.contexts[this.contexts.length - 1];
    },

    restoreContext: function() {
        this.contexts.pop();
        return this;
    }
};