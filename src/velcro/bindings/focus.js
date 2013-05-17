(function() {
    vc.bindings.vcFocus = function(app, element) {
        var dom = vc.dom(element);

        this.init = function(options, bindings) {
            dom.on('focus', function() {
                bindings.bind(true);
            }).on('blur', function() {
                bindings.bind(false);
            });
        };

        this.update = function(options, bindings) {
            if (options.bind) {
                element.focus();
            } else {
                element.blur();
            }
        };
    };
})();