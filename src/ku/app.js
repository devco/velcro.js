ku.App = function() {
    this.attributePrefix  = 'data-ku-';
    this.bindings         = ku.defaultBindings;
    this.context          = {
        $parent: false,
        $root: false
    };
};

ku.App.prototype = {
    bind: function(element, context) {
        if (arguments.length === 1) {
            context = element;
            element = document;
        }

        this.bindOne(element, context);
        this.bindDescendants(element, context);

        return this;
    },

    bindOne: function(element, context) {
        var $this = this;

        each(element.attributes, function(i, node) {
            var name = node.nodeName.substring($this.attributePrefix.length);

            if (typeof $this.bindings[name] === 'function') {
                $this.bindAttribute(element, context, name, node.nodeValue);
            }
        });

        return this;
    },

    bindDescendants: function(parent, context) {
        var $this = this;

        each(parent.childNodes, function(index, element) {
            $this.bind(element, context);
        });

        return this;
    },

    bindAttribute: function (element, context, name, value) {
        this.setContext(context);

        var $this   = this;
        var parsed  = ku.utils.parseBinding(value, context);
        var binding = $this.bindings[name];

        each(parsed, function(index, value) {
            subscribeToUpdatesIfObservable(value);
        });

        initialiseBinding();

        return this.restoreContext();

        function initialiseBinding() {
            var options = extractObservableValues();

            if (typeof binding.init === 'function') {
                binding.init.call(binding, $this, element, options);
            } else {
                binding.call(binding, $this, element, options);
            }
        }

        function subscribeToUpdatesIfObservable(value) {
            if (!ku.utils.isObservable(value)) {
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

            each(parsed, function(index, value) {
                if (ku.utils.isObservable(value)) {
                    options[index] = value();
                } else {
                    options[index] = value;
                }
            });

            return options;
        }
    },

    setContext: function(context) {
        if (typeof context === 'object') {
            context.$parent = this.context;
            context.$root   = this.context.$root || this.context;
            this.context    = context;
        }

        return this;
    },

    getContext: function() {
        return this.context;
    },

    restoreContext: function() {
        this.context = this.context.$parent || {};

        return this;
    }
};