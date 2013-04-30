(function() {
    vc.bindings.vc['with'] = function(app, element) {
        this.update = function(options) {
            if (!options.context) {
                vc.utils.throwForElement(element, 'A context option must be specified.');
            }

            var context = options.context;

            if (typeof options.context === 'function') {
                context = options.context();
            }

            if (typeof options.context !== 'object') {
                vc.utils.throwForElement(element, 'The context option must either be a function that returns an object or an object itself.');
            }

            app.context(context);
        };
    };
})();