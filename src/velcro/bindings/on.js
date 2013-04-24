(function() {
    velcro.bindings.on = velcro.binding({
        update: function(app, element, options) {
            velcro.dom(element).off(options.event, options.callback).on(options.event, options.callback);
        }
    });
})();