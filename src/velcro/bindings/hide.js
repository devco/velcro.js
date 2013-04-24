(function() {
    velcro.bindings.hide = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.style.display = 'none';
            } else {
                element.style.display = null;
            }
        }
    });
})();