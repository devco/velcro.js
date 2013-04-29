(function() {
    vc.bindings.hide = vc.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.style.display = 'none';
            } else {
                element.style.display = null;
            }
        }
    });
})();