(function() {
    vc.bindings.vc.show = function(app, element) {
        this.update = function(options) {
            if (options.test) {
                element.style.display = null;
            } else {
                element.style.display = 'none';
            }
        };
    };
})();