(function() {
    Velcro.Binding = Velcro.Class.extend({
        app: null,

        element: null,

        options: {},

        bound: {},

        init: function(app, element, options, bound) {
            this.app     = app;
            this.element = element;
            this.options = Velcro.utils.merge(this.options, options);
            this.bound   = bound;

            if (typeof this.setup === 'function') {
                this.setup();
            } else if (typeof this.update === 'function') {
                this.update();
            }
        }
    });
})();