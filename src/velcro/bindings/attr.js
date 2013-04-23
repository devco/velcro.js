(function() {
    velcro.bindings.attr = velcro.Binding.extend({
        update: function(app, element, options) {
            var el = velcro.dom(element);

            for (var i in options) {
                el.attr(i, options[i]);
            }
        }
    });
})();