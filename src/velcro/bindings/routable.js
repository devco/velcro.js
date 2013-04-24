(function() {
    velcro.bindings.routable = velcro.binding({
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
    });
})();