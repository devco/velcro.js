(function() {
    velcro.bindings.enable = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                velcro.dom(element).attr('disabled', '');
            } else {
                velcro.dom(element).attr('disabled', 'disabled');
            }
        }
    });
})();