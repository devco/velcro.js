(function() {
    vc.bindings.contents = vc.binding({
        update: function(app, element, options) {
            if (typeof options.text !== 'undefined') {
                vc.dom(element).text(options.text || '');
            } else if (typeof options.html !== 'undefined') {
                vc.dom(element).contents(options.html || '');
            } else {
                vc.utils.throwForElement(element, 'The "content" binding must be given a "text" or "html" option.');
            }
        }
    });
})();