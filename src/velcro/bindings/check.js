(function() {
    velcro.bindings.check = velcro.binding({
        changing: false,

        setup: function(app, element, options, bindings) {
            var $this = this;

            velcro.dom(element).on('change', function() {
                $this.changing = true;

                if (element.checked) {
                    bindings.bind(true);
                } else {
                    bindings.bind(false);
                }

                $this.changing = false;
            });
        },

        update: function(app, element, options) {
            if (this.changing) {
                return;
            }

            if (options.bind) {
                element.checked = true;
            } else {
                element.checked = false;
            }
        }
    });
})();