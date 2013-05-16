(function() {
    vc.bindings.vcOptions = function(app, element) {
        var dom = vc.dom(element);

        this.options = {
            options: [],
            caption: '',
            text: '',
            update: null,
            value: ''
        };

        this.init = function(options) {
            if (typeof options.update === 'function') {
                dom.on('change', function() {
                    options.update(element.value);
                });
            }

            this.update(options);
        };

        this.update = function(options) {
            if (dom.tag() !== 'select') {
                vc.utils.throwForElement(element, 'The options binding can only be bound to select list.');
            }

            if (options.caption) {
                dom.contents('<option value="">' + extract(options.caption) + '</option>');
            }

            if (typeof options.options instanceof vc.Collection) {
                options.options.each(each);
            } else {
                vc.utils.each(options.options, each);
            }

            function each(index, item) {
                dom.append('<option value="' + extractFrom(item, options.value) + '">' + extractFrom(item, options.text) + '</option>');
            };
        };
    };

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

        if (item instanceof vc.Model) {
            return item[using]();
        }

        return item;
    }
})();