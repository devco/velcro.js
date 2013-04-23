(function() {
    velcro.bindings.on = velcro.Binding.extend({
        update: function(app, element, options) {
            velcro.dom(element).off(options.event, options.callback).on(options.event, options.callback);
        }
    });
})();