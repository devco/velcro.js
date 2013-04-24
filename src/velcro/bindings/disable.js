(function() {
    velcro.bindings.disable = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.disabled = true;
            } else {
                element.disabled = false;
            }
        }
    });
})();