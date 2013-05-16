(function() {
    vc.bindings.vcInclude = function(app, element) {
        this.options = {
            path: '',
            context: false,
            callback: function(){},
            view: {}
        };

        this.update = function(options) {
            var view = options.view instanceof vc.View ? options.view : new vc.View(options.view);

            // ensure the target is fixed to the element
            view.options.target = element;

            if (typeof options.context === 'function') {
                options.context = options.context();
            }

            if (!options.path) {
                vc.utils.throwForElement(element, 'A path option must be specified.');
            }

            view.render(options.path, function() {
                app.bindDescendants(element, options.context);

                if (typeof options.callback === 'function') {
                    options.callback();
                }
            });
        };
    };
})();