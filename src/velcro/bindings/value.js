(function() {
    vc.bindings.vc.value = function(app, element) {
        var dom = vc.dom(element);

        this.options = {
            on: 'change'
        };

        this.update = function(options, bindings) {
            dom.off(options.on, update).on(options.on, update);

            element.value = options.value;

            function update() {
                bindings.value(element.value);
            }
        };
    };
})();