(function() {
    vc.bindings.vc.value = function(app, element) {
        var changing = false;
        var dom = vc.dom(element);

        this.options = {
            on: 'change'
        };

        this.init = function(options, bindings) {
            dom.off(options.on, update).on(options.on, update);

            element.value = options.value;

            function update() {
                changing = true;
                bindings.value(element.value);
                changing = false;
            }
        };

        this.update = function(options, bindings) {
            if (changing) {
                return;
            }

            element.value = options.value;
            dom.fire(options.on);
        };
    };
})();