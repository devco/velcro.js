(function() {
    vc.bindings.on = vc.binding({
        update: function(app, element, options) {
            var dom = vc.dom(element);

            vc.utils.each(options, function(name, callback) {
                dom.off(name, callback).on(name, callback);
            });
        }
    });
})();