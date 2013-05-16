(function() {
    vc.bindings.vcCheck = function(app, element) {
        var changing = false;
        var firing = false;
        var dom = vc.dom(element);

        this.init = function(options, bindings) {
            var $this = this;

            dom.on('change', function() {
                if (firing) {
                    return;
                }

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

            firing = true;
            dom.fire('change');
            firing = false;
        };
    };
})();