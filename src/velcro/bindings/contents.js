(function() {
    vc.bindings.vc.contents = function(app, element) {
        var dom = vc.dom(element);

        this.update = function(options) {
            if (typeof options.text !== 'undefined') {
                dom.text(options.text || '');
            } else if (typeof options.html !== 'undefined') {
                dom.contents(options.html || '');
            } else {
                vc.utils.throwForElement(element, 'The "content" binding must be given a "text" or "html" option.');
            }
        };
    };
})();