(function() {
    Velcro.Binding = Velcro.Class.extend({
        init: function(app, element, options) {
            if (typeof this.update === 'function') {
                this.update(app, element, options);
            }
        }
    });
})();