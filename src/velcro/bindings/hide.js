(function() {
    vc.bindings.vcHide = function(app, element) {
        this.update = function(options) {
            if (options.test) {
                element.style.display = 'none';
            } else {
                element.style.display = null;
            }
        };
    };
})();