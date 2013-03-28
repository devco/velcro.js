ku.App = function() {
    this.attributePrefix = 'data-ku-';
    this.bindings        = ku.defaultBindings;
    this.context         = {};
};

ku.App.prototype = {
    run: function(element, context) {
        if (!context) {
            context = element;
            element = document;
        }

        this.context = context;
        this.bindAll(element);
    },

    bindAll: function(element) {
        this.bindOne(element);
        this.bindDescendants(element);
        return this;
    },

    bindOne: function(element) {
        var $this = this;

        each(element.attributes, function(i, node) {
            var name = node.nodeName.substring($this.attributePrefix.length);

            if (typeof $this.bindings[name] === 'function') {
                $this.bindAttribute(element, name, node);
            }
        });

        return this;
    },

    bindDescendants: function(parent) {
        var $this = this;

        each(parent.childNodes, function(index, element) {
            $this.bindAll(element, $this.context);
        });

        return this;
    },

    bindAttribute: function(element, name, attribute) {
        var $this   = this;
        var options = ku.utils.parseBinding(attribute.nodeValue, $this.context);

        this.bindings[name].call(this.bindings[name], this, element, options);

        each(options, function(index, value) {
            if (ku.utils.isObserved(value)) {
                value.__ku_observer.subscribe(function() {
                    $this.bindAttribute(element, name, attribute);
                });
            }
        });

        return this;
    }
};