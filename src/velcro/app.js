Velcro.App = function() {
    this.attributePrefix  = 'data-velcro-';
    this.bindings         = Velcro.defaultBindings;
    this.contexts         = [];
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
        var $this = this;

        each(parent.childNodes, function(index, element) {
            $this.bind(element, context);
        });

        return this;
    },

    bindOne: function(element) {
        var $this = this;

        each(element.attributes, function(i, node) {
            var name = node.nodeName.substring($this.attributePrefix.length);

            if (typeof $this.bindings[name] === 'function') {
                $this.bindAttribute(element, name, node.nodeValue);
            }
        });

        return this;
    },

    bindAttribute: function (element, name, value) {
        var $this   = this;
        var parsed  = Velcro.utils.parseBinding(value, this.context());
        var binding = this.bindings[name];

        each(parsed, function(parsedName, parsedValue) {
            subscribeToUpdatesIfObservable(parsedValue);
        });

        initialiseBinding();

        return this;

        function initialiseBinding() {
            var options = extractObservableValues();

            if (typeof binding.init === 'function') {
                binding.init.call(binding, $this, element, options);
            } else {
                binding.call(binding, $this, element, options);
            }
        }

        function subscribeToUpdatesIfObservable(value) {
            if (!Velcro.utils.isObservable(value)) {
                return;
            }

            value.subscribe(function() {
                var options = extractObservableValues();

                if (typeof binding.update === 'function') {
                    binding.update.call(binding, $this, element, options);
                } else {
                    binding.call(binding, $this, element, options);
                }
            });
        }

        function extractObservableValues() {
            var options = {};

            each(parsed, function(name, value) {
                if (Velcro.utils.isObservable(value)) {
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