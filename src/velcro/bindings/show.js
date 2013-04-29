(function() {
    vc.bindings.show = vc.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.style.display = null;
            } else {
                element.style.display = 'none';
            }
        }
    });
})();