(function() {
    velcro.bindings.options = velcro.Binding.extend({
        options: {
            options: [],
            caption: '',
            text: '',
            value: ''
        },

        update: function(app, element, options) {
            this.check(element);

            var items = options.options;

            if (items.to) {
                items = items.to();
            }

            velcro.utils.each(items, function(i, el) {
                var value  = typeof options.value === 'function' ? options.value(el) : el[options.value];
                var text   = typeof options.text  === 'function' ? options.text(el)  : el[options.text];
                var option = velcro.dom('<option value="' + value + '">' + text + '</option>');

                element.appendChild(option.raw());
            });
        },

        check: function(element) {
            if (velcro.dom(element).tag() !== 'select') {
                velcro.utils.throwForElement(element, 'The options binding can only be bound to select list.');
            }
        }
    });
})();