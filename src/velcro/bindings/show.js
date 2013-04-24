(function() {
    velcro.bindings.show = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.style.display = null;
            } else {
                element.style.display = 'none';
            }
        }
    });
})();