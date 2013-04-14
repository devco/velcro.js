Velcro.defaultBindings = {
    click: Velcro.Binding.extend({
        setup: function() {
            var $this = this;

            Velcro.utils.addEvent(this.element, 'click', function(e) {
                $this.options.callback(e);
            });
        }
    }),

    context: Velcro.Binding.extend({
        update: function() {
            if (!this.options.context) {
                Velcro.utils.throwForElement(this.element, 'A context option must be specified.');
            }

            this.app.context(this.options.context);
        }
    }),

    each: Velcro.Binding.extend({
        clones: null,

        container: null,

        html: null,

        key: '$key',

        value: '$value',

        setup: function() {
            this.clones    = [];
            this.container = this.element.parentNode;
            this.html      = Velcro.utils.html(this.clean(this.element));

            Velcro.utils.destroyElement(this.element);

            if (this.options.key) {
                this.key = this.options.key;
            }

            if (this.options.value) {
                this.value = this.options.value;
            }

            this.update();
        },

        update: function() {
            var $this = this;

            this.reset();

            if (this.options.items instanceof Velcro.Model) {
                this.options.items.each(function(key, value) {
                    each(key, value());
                });
            } else if (this.options.items instanceof Velcro.Collection) {
                this.options.items.each(each);
            } else {
                Velcro.utils.each(this.options.items, each);
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

    'if': Velcro.Binding.extend({
        container: null,

        index: null,

        setup: function() {
            this.container = this.element.parentNode;
            this.index     = Velcro.utils.elementIndex(this.element);

            if (!this.options.test) {
                this.container.removeChild(this.element);
            }

            this.update();
        },

        update: function() {
            if (this.options.test) {
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
        update: function() {
            var options = Velcro.utils.merge({
                path: '',
                context: false,
                callback: function(){},
                view: {}
            }, this.options);

            var view = new Velcro.View(options.view);

            view.options.target = this.element;

            if (typeof options.context === 'function') {
                options.context = options.context();
            }

            if (!options.path) {
                Velcro.utils.throwForElement(element, 'A path option must be specified.');
            }

            view.render(options.path, function() {
                this.app.bindDescendants(this.element, options.context);
                options.callback();
            });
        }
    }),

    routable: Velcro.Binding.extend({
        update: function() {
            var router = this.options.router;

            if (!router) {
                Velcro.utils.throwForElement(this.element, 'Cannot bind router because it does not exist.');
            }

            if (!router instanceof Velcro.Router) {
                Velcro.utils.throwForElement(element, 'Cannot bind router because it is not an instanceof "Velcro.Router".');
            }

            router.view.options.target = this.element;
            router.bind();
        }
    }),

    text: Velcro.Binding.extend({
        update: function() {
            this.element.innerText = this.options.text;
        }
    }),

    value: Velcro.Binding.extend({
        options: {
            on: 'change'
        },

        update: function() {
            var $this = this;

            this.element.value = this.options.value;

            Velcro.utils.addEvent(this.element, this.options.on, function() {
                $this.bound.value($this.element.value);
            });
        }
    })
};