ku.defaultBindings = {
    context: function(element, context) {
        this.context = context.context();
    },

    include: function(element, context) {
        var view = context.view || new ku.View();

        view.target = element;

        view.render(context.path, context.context);
    },

    routable: function(element, context) {
        var router = context.router;

        if (!router) {
            ku.utils.throwForElement(element, 'Cannot bind router "' + value + '" to the main view because it does not exist.');
        }

        if (!router instanceof ku.Router) {
            ku.utils.throwForElement(element, 'Cannot bind router "' + value + '" to the main view because it is not an instanceof "ku.Router".');
        }

        router.view.target = element;
        router.bind();
    },

    text: function(element, context) {
        element.innerText = context.text();
    }
};