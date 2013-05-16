(function() {
    vc.bindings.vcRoutable = function(app, element) {
        this.update = function(options) {
            var router = options.router;

            if (!router) {
                vc.utils.throwForElement(element, 'Cannot bind router because it cannot be found.');
            }

            if (!router instanceof vc.Router) {
                vc.utils.throwForElement(element, 'Cannot bind router because it is not an instanceof "vc.Router".');
            }

            router.view.options.target = element;
            router.bind();
        };
    };
})();