(function() {
    vc.bindings.attr = vc.binding({
        update: function(app, element, options) {
            var el = vc.dom(element);

            for (var i in options) {
                el.attr(i, options[i]);
            }
        }
    });
})();