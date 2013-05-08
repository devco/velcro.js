(function() {
    vc.bindings.vc['with'] = function(app, element) {
        var template = element.innerHTML;

        element.innerHTML = '';

        this.update = function(options) {
            var context;

            if (typeof options.model === 'object') {
                context = options.model;
            } else if (typeof options.controller === 'function') {
                context = options.controller();
            } else {
                vc.utils.throwForElement(element, 'You must either specify a model or controller to the "with" context.');
            }

            element.innerHTML = template;
            app.bindDescendants(element, context);
        };
    };
})();