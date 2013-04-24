(function() {
    velcro.bindings.enable = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.disabled = false;
            } else {
                element.disabled = true;
            }
        }
    });
})();