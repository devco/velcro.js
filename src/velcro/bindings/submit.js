(function() {
    vc.bindings.vc.submit = function(app, element) {
        var dom = vc.dom(element);

        this.init = function(options, bindings) {
            dom.on('submit', function(e) {
                if (options.callback() !== true) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        };
    };
})();