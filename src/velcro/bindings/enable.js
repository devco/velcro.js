(function() {
    vc.bindings.enable = vc.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.disabled = false;
            } else {
                element.disabled = true;
            }
        }
    });
})();