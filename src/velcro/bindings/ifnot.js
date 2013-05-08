(function() {
    vc.bindings.vc.ifnot = function(app, element) {
        var display = 'block';

        this.init = function(options) {
            this.display = element.style.display;

            if (test(options.test)) {
                element.style.display = 'none';
            }
        };

        this.update = function(options) {
            if (test(options.test)) {
                element.style.display = 'none';
            } else if (element.parentNode) {
                element.style.display = this.display;
            }
        };
    };

    function test(expr) {
        if (expr instanceof vc.Collection) {
            return expr.length > 0;
        }

        return expr;
    }
})();