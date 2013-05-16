(function() {
    vc.bindings.vcFocus = function(app, element) {
        var changing = false;
        var firingBlur = false;
        var firingFocus = false;
        var dom = vc.dom(element);

        this.init = function(options, bindings) {
            dom.on('focus', function() {
                if (firingFocus) {
                    return;
                }

                changing = true;
                bindings.bind(true);
                changing = false;
            }).on('blur', function() {
                if (firingBlur) {
                    return;
                }

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

                firingFocus = true;
                dom.fire('focus');
                firingFocus = false;
            } else {
                element.blur();

                firingBlur = true;
                dom.fire('blur');
                firingBlur = false;
            }
        };
    };
})();