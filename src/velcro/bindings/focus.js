(function() {
    vc.bindings.vc.focus = function(app, element) {
        var changing = false;
        var dom = vc.dom(element);

        this.init = function(options, bindings) {
            dom.on('focus', function() {
                changing = true;
                bindings.bind(true);
                changing = false;
            }).on('blur', function() {
                changing = true;
                bindings.bind(false);
                changing = false;
            });
        };

        this.update = function(options, bindings) {
            if (changing) {
                return;
            }

            if (options.bind) {
                element.focus();
                dom.fire('focus');
            } else {
                element.blur();
                dom.fire('blur');
            }
        };
    };
})();