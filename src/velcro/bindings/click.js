(function() {
    velcro.bindings.click = velcro.binding({
        update: function(app, element, options) {
            velcro.dom(element).off('click', options.callback).on('click', options.callback);
        }
    })
})();