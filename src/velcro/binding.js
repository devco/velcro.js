(function() {
    vc.bindings = {};

    vc.Binding = vc.Class.extend({
        options: {},

        init: function(app, element, options, bound) {
            options = vc.utils.merge(this.options, options);

            if (typeof this.setup === 'function') {
                this.setup(app, element, options, bound);
            } else if (typeof this.update === 'function') {
                this.update(app, element, options, bound);
            }
        }
    });

    vc.binding = function(def) {
        return vc.Binding.extend(def);
    };
})();