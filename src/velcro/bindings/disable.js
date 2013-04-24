(function() {
    velcro.bindings.disable = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                velcro.dom(element).attr('disabled', 'disabled');
            } else {
                velcro.dom(element).attr('disabled', '');
            }
        }
    });
})();