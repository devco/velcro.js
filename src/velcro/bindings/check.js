(function() {
    vc.bindings.vcCheck = function(app, element) {
        var dom = vc.dom(element);

        this.init = function(options, bindings) {
            dom.on('change', function() {
                if (element.checked) {
                    bindings.bind(true);
                } else {
                    bindings.bind(false);
                }
            });
        };

        this.update = function(options) {
            if (options.bind) {
                element.checked = true;
            } else {
                element.checked = false;
            }
        };
    };
})();