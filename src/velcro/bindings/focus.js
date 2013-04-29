(function() {
    vc.bindings.focus = vc.binding({
        changing: false,

        setup: function(app, element, options, bindings) {
            var $this = this;

            vc.dom(element)
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
                vc.dom(element).fire('focus');
            } else {
                element.blur();
                vc.dom(element).fire('blur');
            }
        }
    });
})();