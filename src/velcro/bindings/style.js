(function() {
    vc.bindings.style = vc.binding({
        update: function(app, element, options) {
            for (var i in options) {
                element.style[i] = typeof options[i] === 'function' ? options[i]() : options[i];
            }
        }
    });
})();