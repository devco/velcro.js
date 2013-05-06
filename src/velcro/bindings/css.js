(function() {
    vc.bindings.vc.css = function(app, element) {
        var element = vc.dom(element);
        var originals = element.css();

        this.update = function(options) {
            element.css(vc.utils.merge(originals, options));
        };
    };
})();