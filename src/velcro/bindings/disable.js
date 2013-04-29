(function() {
    vc.bindings.disable = vc.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.disabled = true;
            } else {
                element.disabled = false;
            }
        }
    });
})();