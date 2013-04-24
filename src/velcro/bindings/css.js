(function() {
    velcro.bindings.css = velcro.binding({
        update: function(app, element, options) {
            velcro.dom(element).css(options);
        }
    });
})();