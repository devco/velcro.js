(function() {
    velcro.bindings['if'] = velcro.binding({
        display: 'none',

        setup: function(app, element, options) {
            this.display = element.style.display;

            if (!options.test) {
                element.style.display = 'none';
            }
        },

        update: function(app, element, options) {
            if (options.test) {
                element.style.display = this.display;
            } else if (element.parentNode) {
                element.style.display = 'none';
            }
        }
    });
})();