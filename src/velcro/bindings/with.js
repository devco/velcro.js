(function() {
    vc.bindings['with'] = vc.binding({
        update: function(app, element, options) {
            if (!options.context) {
                vc.utils.throwForElement(element, 'A context option must be specified.');
            }

            app.context(options.context);
        }
    });
})();