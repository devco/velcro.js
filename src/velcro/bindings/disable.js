(function() {
    vc.bindings.vc.disable = function(app, element) {
        this.update = function(options) {
            if (options.test) {
                element.disabled = true;
            } else {
                element.disabled = false;
            }
        };
    };
})();