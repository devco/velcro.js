(function() {
    vc.bindings.vcValue = function(app, element) {
        var dom = vc.dom(element);

        this.options = {
            on: 'change'
        };

        this.init = function(options, bindings) {
            dom.on(options.on, function() {
                bindings.value(element.value);
            });

            this.update(options, bindings);
        };

        this.update = function(options, bindings) {
            element.value = options.value;
        };
    };
})();