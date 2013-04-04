var context = function(app, element, options) {
    app.context(options.context);
};

var include = function(app, element, options) {
    var view    = options.view || new Velcro.View();
    var subApp  = options.app || app;
    var context = options.context;
    view.target = element;

    if (typeof context === 'function') {
        context = context();
    }

    view.render(options.path, function() {
        app.bindDescendants(element, context);

        if (typeof options.callback === 'function') {
            options.callback();
        }
    });
};

var routable = function(app, element, options) {
    var router = options.router;

    if (!router) {
        Velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" to the main view because it does not exist.');
    }

    if (!router instanceof Velcro.Router) {
        Velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" to the main view because it is not an instanceof "Velcro.Router".');
    }

    router.view.target = element;
    router.bind();
};

var text = function(app, element, options) {
    element.innerText = options.text;
};

Velcro.defaultBindings = {
    context: context,
    include: include,
    routable: routable,
    text: text
};