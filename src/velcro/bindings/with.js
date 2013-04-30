(function() {
    vc.bindings.vc['with'] = function(app, element) {
        this.update = function(options) {
            if (!options.context) {
                vc.utils.throwForElement(element, 'A context option must be specified.');
            }

            app.context(options.context);
        };
    };
})();