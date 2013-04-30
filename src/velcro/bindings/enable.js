(function() {
    vc.bindings.vc.enable = function(app, element) {
        this.update = function(options) {
            if (options.test) {
                element.disabled = false;
            } else {
                element.disabled = true;
            }
        };
    };
})();