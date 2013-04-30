(function() {
    vc.bindings.vc.on = function(app, element) {
        var dom = vc.dom(element);

        this.update = function(options) {
            vc.utils.each(options, function(name, callback) {
                dom.off(name, callback).on(name, callback);
            });
        };
    };
})();