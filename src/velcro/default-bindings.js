velcro.defaultBindings = {
    attr: velcro.Binding.extend({
        update: function(app, element, options) {
            var el = velcro.dom(element);

            for (var i in options) {
                el.attr(i, options[i]);
            }
        }
    }),

    click: velcro.Binding.extend({
        update: function(app, element, options) {
            velcro.dom(element).off('click', options.callback).on('click', options.callback);
        }
    }),

    context: velcro.Binding.extend({
        update: function(app, element, options) {
            if (!options.context) {
                velcro.utils.throwForElement(element, 'A context option must be specified.');
            }

            app.context(options.context);
        }
    }),

    css: velcro.Binding.extend({
        update: function(app, element, options) {
            velcro.dom(element).css(options);
        }
    }),

    each: velcro.Binding.extend({
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
            var dom = velcro.dom(element);
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

            velcro.utils.each(this.clones, function(index, clone) {
                velcro.dom(clone).destroy();
            });

            this.clones = [];

            if (options.items instanceof velcro.Model) {
                options.items.each(function(key, value) {
                    each(key, value());
                });
            } else if (options.items instanceof velcro.Collection) {
                options.items.each(each);
            } else {
                velcro.utils.each(options.items, each);
            }

            function each(key, value) {
                var context = velcro.utils.isObject(value) ? value : {};

                context[$this.options.key]   = key;
                context[$this.options.value] = value;

                var clone = velcro.dom($this.template).raw();
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
    }),

    extend: velcro.Binding.extend({
        options: {
            path: '',
            view: {}
        },

        html: '',

        setup: function(app, element, options) {
            this.html = element.innerHTML;
            this.update(app, element, options);
        },

        update: function(app, element, options) {
            var view    = options.view instanceof velcro.View ? options.view : new velcro.View(options.view);
            var $this   = this;
            var context = app.context();

            context.$content    = this.html;
            view.options.target = element;

            view.render(options.path, function() {
                app.bindDescendants(element, context);
            });
        }
    }),

    html: velcro.Binding.extend({
        update: function(app, element, options) {
            element.innerHTML = options.html;
        }
    }),

    'if': velcro.Binding.extend({
        display: 'none',

        setup: function(app, element, options) {
            this.display = element.style.display;

            if (!options.test) {
                element.style.display = 'none';
            }
        },

        update: function(app, element, options) {
            if (options.test) {
                element.style.display = this.display;
            } else if (element.parentNode) {
                element.style.display = 'none';
            }
        }
    }),

    include: velcro.Binding.extend({
        options: {
            path: '',
            context: false,
            callback: function(){},
            view: {}
        },

        update: function(app, element, options) {
            var view = options.view instanceof velcro.View ? options.view : new velcro.View(options.view);

            // ensure the target is fixed to the element
            view.options.target = element;

            if (typeof options.context === 'function') {
                options.context = options.context();
            }

            if (!options.path) {
                velcro.utils.throwForElement(element, 'A path option must be specified.');
            }

            view.render(options.path, function() {
                app.bindDescendants(element, options.context);

                if (typeof options.callback === 'function') {
                    options.callback();
                }
            });
        }
    }),

    on: velcro.Binding.extend({
        update: function(app, element, options) {
            velcro.dom(element).off(options.event, options.callback).on(options.event, options.callback);
        }
    }),

    routable: velcro.Binding.extend({
        update: function(app, element, options) {
            var router = options.router;

            if (!router) {
                velcro.utils.throwForElement(element, 'Cannot bind router because it cannot be found.');
            }

            if (!router instanceof velcro.Router) {
                velcro.utils.throwForElement(element, 'Cannot bind router because it is not an instanceof "velcro.Router".');
            }

            router.view.options.target = element;
            router.bind();
        }
    }),

    submit: velcro.Binding.extend({
        setup: function(app, element, options, bindings) {
            velcro.dom(element).on('submit', function(e) {
                if (options.callback() !== true) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    }),

    text: velcro.Binding.extend({
        update: function(app, element, options) {
            element.innerText = options.text;
        }
    }),

    value: velcro.Binding.extend({
        options: {
            on: 'change'
        },

        update: function(app, element, options, bindings) {
            velcro.dom(element).off(options.on, update).on(options.on, update);

            element.value = options.value;

            function update() {
                bindings.value(element.value);
            }
        }
    })
};