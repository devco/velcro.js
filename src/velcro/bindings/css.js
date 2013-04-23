(function() {
    velcro.bindings.css = velcro.Binding.extend({
        update: function(app, element, options) {
            velcro.dom(element).css(options);
        }
    });
})();