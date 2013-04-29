(function() {
    vc.bindings.css = vc.binding({
        update: function(app, element, options) {
            vc.dom(element).css(options);
        }
    });
})();