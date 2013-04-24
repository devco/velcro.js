(function() {
    velcro.bindings.options = velcro.binding({
        options: {
            options: [],
            caption: '',
            text: '',
            value: ''
        },

        update: function(app, element, options) {
            this.check(element);

            if (typeof options.caption !== 'undefined') {
                velcro.dom(element).contents('<option value="">' + extract(options.caption) + '</option>');
            }

            if (typeof options.options instanceof velcro.Collection) {
                options.options.each(each);
            } else {
                velcro.utils.each(options.options, each);
            }

            function each(index, item) {
                velcro.dom(element).append('<option value="' + extractFrom(item, options.value) + '">' + extractFrom(item, options.text) + '</option>');
            };
        },

        check: function(element) {
            if (velcro.dom(element).tag() !== 'select') {
                velcro.utils.throwForElement(element, 'The options binding can only be bound to select list.');
            }
        }
    });

    function extract(item) {
        if (!item) {
            return '';
        }

        if (typeof item === 'function') {
            return item();
        }

        return item;
    }

    function extractFrom(item, using) {
        if (!using) {
            return '';
        }

        if (typeof using === 'function') {
            return using(item);
        }

        if (item instanceof velcro.Model) {
            return item[using]();
        }

        return item;
    }
})();