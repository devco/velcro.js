(function() {
    vc.bindings.vc.style = function(app, element) {
        this.update = function(options) {
            for (var i in options) {
                element.style[i] = typeof options[i] === 'function' ? options[i]() : options[i];
            }
        };
    };
})();