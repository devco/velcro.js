(function() {
    vc.bindings.vcEnable = function(app, element) {
        this.update = function(options) {
            if (options.test) {
                element.disabled = false;
            } else {
                element.disabled = true;
            }
        };
    };
})();