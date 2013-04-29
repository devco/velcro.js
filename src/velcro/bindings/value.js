(function() {
    vc.bindings.value = vc.binding({
        options: {
            on: 'change'
        },

        update: function(app, element, options, bindings) {
            vc.dom(element).off(options.on, update).on(options.on, update);

            element.value = options.value;

            function update() {
                bindings.value(element.value);
            }
        }
    });
})();