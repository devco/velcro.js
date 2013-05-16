(function() {
    vc.bindings.vcOn = function(app, element) {
        var dom = vc.dom(element);

        this.init = function(options) {
            for (var i in options) {
                dom.on(i, options[i]);
            }
        };
    };
})();