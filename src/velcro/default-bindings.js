Velcro.defaultBindings = {
    context: function(app, element, options) {
        if (!options.context) {
            Velcro.utils.throwForElement(element, 'A context option must be specified.');
        }

        app.context(options.context);
    },

    each: function(app, element, options) {
        var clone = Velcro.utils.html(element);
    },

    include: function(app, element, options) {
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
    },

    routable: function(app, element, options) {
        var router = options.router;

        if (!router) {
            Velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" because it does not exist.');
        }

        if (!router instanceof Velcro.Router) {
            Velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" because it is not an instanceof "Velcro.Router".');
        }

        router.view.options.target = element;
        router.bind();
    },

    text: function(app, element, options) {
        element.innerText = options.text;
    }
};