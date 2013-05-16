(function() {
    vc.bindings.vcCss = function(app, element) {
        var element = vc.dom(element);
        var originals = element.css();

        this.update = function(options) {
            element.css(vc.utils.merge(originals, options));
        };
    };
})();