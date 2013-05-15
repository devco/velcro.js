(function() {
    vc.bindings.vc.value = function(app, element) {
        var changing = false;
        var firing = false;
        var dom = vc.dom(element);

        this.options = {
            on: 'change'
        };

        this.init = function(options, bindings) {
            dom.on(options.on, function() {
                if (firing) {
                    return;
                }

                changing = true;
                bindings.value(element.value);
                changing = false;
            });

            this.update(options, bindings);
        };

        this.update = function(options, bindings) {
            if (changing) {
                return;
            }

            element.value = options.value;

            firing = true;
            dom.fire(options.on);
            firing = false;
        };
    };
})();