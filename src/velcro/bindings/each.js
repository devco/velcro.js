(function() {
    vc.bindings.each = vc.binding({
        app: null,

        clones: null,

        container: null,

        options: {
            key: '$key',
            value: '$value'
        },

        reference: null,

        template: null,

        setup: function(app, element, options) {
            var dom = vc.dom(element);
            dom.attr(app.options.attributePrefix + 'each', '');

            this.app       = app;
            this.clones    = [];
            this.container = element.parentNode;
            this.template  = dom.html();
            this.reference = document.createComment('each placeholder');

            element.parentNode.insertBefore(this.reference, element);
            dom.destroy();
            this.update(app, element, options);
        },

        update: function(app, element, options) {
            var $this = this;

            vc.utils.each(this.clones, function(index, clone) {
                vc.dom(clone).destroy();
            });

            this.clones = [];

            if (options.items instanceof vc.Model) {
                options.items.each(function(key, value) {
                    each(key, value());
                });
            } else if (options.items instanceof vc.Collection) {
                options.items.each(each);
            } else {
                vc.utils.each(options.items, each);
            }

            function each(key, value) {
                var context = vc.utils.isObject(value) ? value : {};

                context[$this.options.key]   = key;
                context[$this.options.value] = value;

                var clone = vc.dom($this.template).raw();
                app.bind(clone, context);
                $this.clones.push(clone);
                $this.container.insertBefore(clone, $this.reference);

                delete context[$this.options.key];
                delete context[$this.options.value];
            }
        },

        clean: function(app, element) {
            element.removeAttribute(app.options.attributePrefix + 'each');
            return element;
        }
    });
})();