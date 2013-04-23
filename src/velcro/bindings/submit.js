(function() {
    velcro.bindings.submit = velcro.Binding.extend({
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