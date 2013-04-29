(function() {
    vc.bindings.submit = vc.binding({
        setup: function(app, element, options, bindings) {
            vc.dom(element).on('submit', function(e) {
                if (options.callback() !== true) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    });
})();