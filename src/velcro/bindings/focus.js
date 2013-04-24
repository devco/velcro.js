(function() {
    velcro.bindings.focus = velcro.binding({
        changing: false,

        setup: function(app, element, options, bindings) {
            var $this = this;

            velcro.dom(element)
                .on('focus', function() {
                    $this.changing = true;
                    bindings.bind(true);
                    $this.changing = false;
                })
                .on('blur', function() {
                    $this.changing = true;
                    bindings.bind(false);
                    $this.changing = false;
                });
        },

        update: function(app, element, options, bindings) {
            if (this.changing) {
                return;
            }

            if (options.bind) {
                element.focus();
                velcro.dom(element).fire('focus');
            } else {
                element.blur();
                velcro.dom(element).fire('blur');
            }
        }
    });
})();