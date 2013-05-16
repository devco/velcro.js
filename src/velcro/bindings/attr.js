(function() {
    vc.bindings.vcAttr = function(app, element) {
        this.update = function(options, bindings) {
            var el = vc.dom(element);

            for (var i in options) {
                el.attr(i, options[i]);
            }
        }
    };
})();