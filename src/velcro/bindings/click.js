(function() {
    vc.bindings.click = vc.binding({
        update: function(app, element, options) {
            vc.dom(element).off('click', options.callback).on('click', options.callback);
        }
    })
})();