(function() {
    velcro.bindings.visible = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.style.display = null;
            } else {
                element.style.display = 'none';
            }
        }
    });
})();