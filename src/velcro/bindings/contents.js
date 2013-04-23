(function() {
    velcro.bindings.contents = velcro.Binding.extend({
        options: {
            text: false,
            html: false,
        },

        update: function(app, element, options) {
            if (typeof options.text === 'string') {
                velcro.dom(element).text(options.text);
            } else if (typeof options.html === 'string') {
                velcro.dom(element).contents(options.html);
            } else {
                velcro.utils.throwForElement(element, 'The "content" binding must be given a "text" or "html" option.');
            }
        }
    });
})();