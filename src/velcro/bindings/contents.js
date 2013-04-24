(function() {
    velcro.bindings.contents = velcro.binding({
        update: function(app, element, options) {
            if (typeof options.text !== 'undefined') {
                velcro.dom(element).text(options.text || '');
            } else if (typeof options.html !== 'undefined') {
                velcro.dom(element).contents(options.html || '');
            } else {
                velcro.utils.throwForElement(element, 'The "content" binding must be given a "text" or "html" option.');
            }
        }
    });
})();