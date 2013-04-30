(function() {
    vc.bindings.vc.css = function(app, element) {
        this.update = function(options) {
            vc.dom(element).css(options);
        };
    };
})();