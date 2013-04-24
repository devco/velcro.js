(function() {
    velcro.bindings.on = velcro.binding({
        update: function(app, element, options) {
            var dom = velcro.dom(element);

            velcro.utils.each(options, function(name, callback) {
                dom.off(name, callback).on(name, callback);
            });
        }
    });
})();