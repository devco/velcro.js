Velcro.defaultBindings = {
    click: Velcro.Binding.extend({
        options: {
            block: true,
            propagate: false
        },

        setup: function(app, element, options) {
            Velcro.utils.addEvent(element, 'click', function(e) {
                if (options.block) {
                    e.preventDefault();
                }

                if (!options.propagate) {
                    e.stopPropagation();
                }

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

        options: {
            key: '$key',
            value: '$value'
        },

        template: null,

        setup: function(app, element, options) {
            this.app       = app;
            this.clones    = [];
            this.container = element.parentNode;
            this.template  = Velcro.utils.html(this.clean(app, element));

            Velcro.utils.destroyElement(element);
        },

        update: function(app, element, options) {
            var $this = this;

            this.reset(element);

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

                context[$this.options.key]   = key;
                context[$this.options.value] = value;

                var clone = Velcro.utils.createElement($this.template);
                app.bind(clone, context);
                $this.clones.push(clone);
                $this.container.appendChild(clone);

                delete context[$this.options.key];
                delete context[$this.options.value];
            }
        },

        reset: function(element) {
            Velcro.utils.each(this.clones, function(index, clone) {
                Velcro.utils.destroyElement(clone);
            });

            this.clones = [];

            // previous elements aren't completely destroyed unless this is done
            this.container.innerHTML = '';

            return this;
        },

        clean: function(app, element) {
            element.removeAttribute(app.options.attributePrefix + 'each');
            return element;
        }
    }),

    'if': Velcro.Binding.extend({
        container: null,

        html: null,

        index: null,

        setup: function(app, element, options) {
            this.container = element.parentNode;
            this.element   = element;
            this.index     = Velcro.utils.elementIndex(element);

            if (!options.test) {
                this.container.removeChild(this.element);
            }
        },

        update: function(app, element, options) {
            if (options.test) {
                if (this.container.childNodes[this.index]) {
                    this.container.insertBefore(this.element, this.container.childNodes[this.index]);
                } else {
                    this.container.appendChild(this.element);
                }
            } else if (this.element.parentNode) {
                this.container.removeChild(this.element);
            }
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

    submit: Velcro.Binding.extend({
        options: {
            block: true,
            propagate: false
        },

        setup: function(app, element, options, bindings) {
            Velcro.utils.addEvent(element, 'submit', function(e) {
                if (options.block) {
                    e.preventDefault();
                }

                if (!options.propagate) {
                    e.stopPropagation();
                }

                options.callback(e);
            });
        }
    }),

    text: Velcro.Binding.extend({
        update: function(app, element, options) {
            element.innerText = options.text;
        }
    }),

    value: Velcro.Binding.extend({
        options: {
            on: 'change'
        },

        setup: function(app, element, options, bindings) {
            Velcro.utils.addEvent(element, options.on, function() {
                bindings.value(element.value);
            });
        },

        update: function(app, element, options, bindings) {
            element.value = options.value;
        }
    })
};