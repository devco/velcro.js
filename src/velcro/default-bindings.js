Velcro.defaultBindings = {
    click: Velcro.Binding.extend({
        init: function(app, element, options) {
            Velcro.utils.addEvent(element, 'click', function(e) {
                options.callback(e);
            });
        }
    }),

    context: Velcro.Binding.extend({
        update: function(app, element, options) {
            if (!options.context) {
                Velcro.utils.throwForElement(element, 'A context option must be specified.');
            }

            app.context(options.context);
        }
    }),

    each: Velcro.Binding.extend({
        app: null,

        clones: null,

        container: null,

        html: null,

        key: '$key',

        value: '$value',

        init: function(app, element, options) {
            this.app       = app;
            this.clones    = [];
            this.container = element.parentNode;
            this.html      = Velcro.utils.html(this.clean(element));

            Velcro.utils.destroyElement(element);

            if (options.key) {
                this.key = options.key;
            }

            if (options.value) {
                this.value = options.value;
            }

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
                var context = Velcro.utils.isObject(value) ? value : {};

                context[$this.key]   = key;
                context[$this.value] = value;

                var clone = Velcro.utils.createElement($this.html);
                $this.app.bind(clone, context);
                $this.clones.push(clone);
                $this.container.appendChild(clone);

                delete context[$this.key];
                delete context[$this.value];
            }
        },

        reset: function() {
            Velcro.utils.each(this.clones, function(index, clone) {
                Velcro.utils.destroyElement(clone);
            });

            this.clones = [];

            // previous elements aren't completely destroyed unless this is done
            this.container.innerHTML = '';

            return this;
        },

        clean: function(element) {
            element.removeAttribute(this.app.options.attributePrefix + 'each');
            return element;
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