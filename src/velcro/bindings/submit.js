(function() {
    velcro.bindings.submit = velcro.binding({
        setup: function(app, element, options, bindings) {
            velcro.dom(element).on('submit', function(e) {
                if (options.callback() !== true) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    });
})();