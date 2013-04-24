(function() {
    velcro.bindings.attr = velcro.binding({
        update: function(app, element, options) {
            var el = velcro.dom(element);

            for (var i in options) {
                el.attr(i, options[i]);
            }
        }
    });
})();