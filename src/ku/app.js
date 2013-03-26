ku.App = function() {
    this.attributePrefix = 'data-ku-';
    this.bindings        = ku.defaultBindings;
    this.context         = null;
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
                $this.bindAttribute(element, name, ku.utils.parseBinding(node.nodeValue, $this.context));
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

    bindAttribute: function(element, name, context) {
        var $this = this;

        this.bindings[name].call($this, element, context);

        each(context, function(index, value) {
            if (typeof value.subscribe === 'function') {
                value.subscribe(function() {
                    $this.bindAttribute(element, name, context);
                });
            }
        });

        return this;
    }
};