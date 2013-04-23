(function() {
    velcro.bindings.value = velcro.Binding.extend({
        options: {
            on: 'change'
        },

        update: function(app, element, options, bindings) {
            velcro.dom(element).off(options.on, update).on(options.on, update);

            element.value = options.value;

            function update() {
                bindings.value(element.value);
            }
        }
    });
})();