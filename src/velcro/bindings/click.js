(function() {
    velcro.bindings.click = velcro.Binding.extend({
        update: function(app, element, options) {
            velcro.dom(element).off('click', options.callback).on('click', options.callback);
        }
    })
})();