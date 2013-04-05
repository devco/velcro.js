var context = function(app, element, options) {
    if (!options.context) {
        velcro.utils.throwForElement(element, 'A context option must be specified.');
    }

    app.context(options.context);
};

var include = function(app, element, options) {
    options = velcro.utils.merge({
        path: '',
        context: false,
        callback: function(){},
        view: {}
    }, options);

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
};

var routable = function(app, element, options) {
    var router = options.router;

    if (!router) {
        velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" because it does not exist.');
    }

    if (!router instanceof velcro.Router) {
        velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" because it is not an instanceof "velcro.Router".');
    }

    router.view.options.target = element;
    router.bind();
};

var text = function(app, element, options) {
    element.innerText = options.text;
};

velcro.defaultBindings = {
    context: context,
    include: include,
    routable: routable,
    text: text
};