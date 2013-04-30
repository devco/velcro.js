(function() {
    vc.bindings.vc.check = function(app, element) {
        var changing = false;

        this.init = function(options, bindings) {
            var $this = this;

            vc.dom(element).on('change', function() {
                changing = true;

                if (element.checked) {
                    bindings.bind(true);
                } else {
                    bindings.bind(false);
                }

                changing = false;
            });
        };

        this.update = function(options) {
            if (changing) {
                return;
            }

            if (options.bind) {
                element.checked = true;
            } else {
                element.checked = false;
            }
        };
    };
})();