Velcro.defaultBindings = {
    context: Velcro.Binding.extend({
        update: function(app, element, options) {
            if (!options.context) {
                Velcro.utils.throwForElement(element, 'A context option must be specified.');
            }

            app.context(options.context);
        }
    }),

    each: Velcro.Binding.extend({
        clones: null,

        container: null,

        html: null,

        init: function(app, element, options) {
            element.removeAttribute(app.options.attributePrefix + 'each');

            this.clones    = [];
            this.container = element.parentNode;
            this.html      = Velcro.utils.html(element);

            this.container.removeChild(element);
            element.innerHTML = '';
            this.$super(app, element, options);
        },

        update: function(app, element, options) {
            var $this = this;

            this.reset();

            if (options.items instanceof Velcro.Model) {
                options.items.each(function(key, value) {
                    each(key, value());
                });
            } else if (options.items instanceof Velcro.Collection) {
                options.items.each(each);
            } else {
                Velcro.utils.each(options.items, each);
            }

            function each(key, value) {
                if (Velcro.utils.isObject(value)) {
                    value.$key   = key;
                    value.$value = value;
                } else {
                    value = {
                        $key: key,
                        $value: value
                    };
                }

                var clone = Velcro.utils.element($this.html);
                app.bindDescendants(clone, value);
                $this.clones.push(clone);
                $this.container.appendChild(clone);
            }
        },

        reset: function() {
            var $this = this;

            Velcro.utils.each(this.clones, function(index, clone) {
                $this.container.removeChild(clone);
            });

            this.clones = [];
        }
    }),

    include: Velcro.Binding.extend({
        update: function(app, element, options) {
            options = Velcro.utils.merge({
                path: '',
                context: false,
                callback: function(){},
                view: {}
            }, options);

            var view = new Velcro.View(options.view);

            view.options.target = element;

            if (typeof options.context === 'function') {
                options.context = options.context();
            }

            if (!options.path) {
                Velcro.utils.throwForElement(element, 'A path option must be specified.');
            }

            view.render(options.path, function() {
                app.bindDescendants(element, options.context);
                options.callback();
            });
        }
    }),

    routable: Velcro.Binding.extend({
        update: function(app, element, options) {
            var router = options.router;

            if (!router) {
                Velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" because it does not exist.');
            }

            if (!router instanceof Velcro.Router) {
                Velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" because it is not an instanceof "Velcro.Router".');
            }

            router.view.options.target = element;
            router.bind();
        }
    }),

    text: Velcro.Binding.extend({
        update: function(app, element, options) {
            element.innerText = options.text;
        }
    })
};