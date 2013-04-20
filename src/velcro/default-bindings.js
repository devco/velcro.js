velcro.defaultBindings = {
    attr: velcro.Binding.extend({
        update: function(app, element, options) {
            for (var i in options) {
                velcro.utils.setAttribute(element, i, options[i]);
            }
        }
    }),

    click: velcro.Binding.extend({
        options: {
            block: true,
            propagate: false
        },

        setup: function(app, element, options) {
            velcro.utils.addEvent(element, 'click', function(e) {
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

    context: velcro.Binding.extend({
        update: function(app, element, options) {
            if (!options.context) {
                velcro.utils.throwForElement(element, 'A context option must be specified.');
            }

            app.setContext(options.context);
        }
    }),

    css: velcro.Binding.extend({
        update: function(app, element, options) {
            var css = velcro.utils.getAttribute(element, 'class').split(/\s+/);

            for (var i in options) {
                if (options[i]) {
                    if (css.indexOf(i) === -1) {
                        css.push(options[i]);
                    }
                } else {
                    var index = css.indexOf(i);

                    if (index > -1) {
                        css.splice(index, 1);
                    }
                }
            }

            velcro.utils.setAttribute(element, 'class', css.join(' '));
        }
    }),

    each: velcro.Binding.extend({
        app: null,

        clones: null,

        container: null,

        guid: null,

        options: {
            key: '$key',
            value: '$value'
        },

        reference: null,

        template: null,

        setup: function(app, element, options) {
            this.app       = app;
            this.clones    = [];
            this.container = element.parentNode;
            this.guid      = velcro.utils.guid();
            this.template  = velcro.utils.html(this.clean(app, element));
            this.reference = document.createComment(this.guid);

            element.parentNode.insertBefore(this.reference, element);
            velcro.utils.destroyElement(element);
            this.update(app, element, options);
        },

        update: function(app, element, options) {
            var $this = this;

            this.reset();

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

                var clone = velcro.utils.createElement($this.template);
                app.bind(clone, context);
                $this.clones.push(clone);
                $this.container.insertBefore(clone, $this.reference);

                delete context[$this.options.key];
                delete context[$this.options.value];
            }
        },

        reset: function() {
            velcro.utils.each(this.clones, function(index, clone) {
                velcro.utils.destroyElement(clone);
            });

            this.clones = [];

            return this;
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
            var view    = new velcro.View(options.view);
            var $this   = this;
            var context = app.getContext();

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
            var view = new velcro.View(options.view);

            view.options.target = element;

            if (typeof options.context === 'function') {
                options.context = options.context();
            }

            if (!options.path) {
                velcro.utils.throwForElement(element, 'A path option must be specified.');
            }

            view.render(options.path, function() {
                app.bindDescendants(element, options.context);
                options.callback();
            });
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
        options: {
            block: true,
            propagate: false
        },

        setup: function(app, element, options, bindings) {
            velcro.utils.addEvent(element, 'submit', function(e) {
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

    text: velcro.Binding.extend({
        update: function(app, element, options) {
            element.innerText = options.text;
        }
    }),

    value: velcro.Binding.extend({
        options: {
            on: 'change'
        },

        setup: function(app, element, options, bindings) {
            velcro.utils.addEvent(element, options.on, function() {
                bindings.value(element.value);
            });
        },

        update: function(app, element, options, bindings) {
            element.value = options.value;
        }
    })
};