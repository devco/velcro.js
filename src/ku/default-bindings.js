var context = function(app, element, options) {
    app.context = options.context;
};

var include = function(app, element, options) {
    var view = options.view || new ku.View();

    view.target = element;

    view.render(options.path, options.context);
};

var routable = function(app, element, options) {
    var router = options.router;

    if (!router) {
        ku.utils.throwForElement(element, 'Cannot bind router "' + value + '" to the main view because it does not exist.');
    }

    if (!router instanceof ku.Router) {
        ku.utils.throwForElement(element, 'Cannot bind router "' + value + '" to the main view because it is not an instanceof "ku.Router".');
    }

    router.view.target = element;
    router.bind();
};

var text = function(app, element, options) {
    element.innerText = options.text;
};

ku.defaultBindings = {
    context: context,
    include: include,
    routable: routable,
    text: text
};