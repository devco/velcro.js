(function() {
    vc.bindings.vc['if'] = function(app, element) {
        var display = 'none';

        this.init = function(options) {
            this.display = element.style.display;

            if (!options.test) {
                element.style.display = 'none';
            }
        };

        this.update = function(options) {
            if (options.test) {
                element.style.display = this.display;
            } else if (element.parentNode) {
                element.style.display = 'none';
            }
        };
    };
})();