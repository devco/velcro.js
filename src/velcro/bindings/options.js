(function() {
    vc.bindings.vc.options = function(app, element) {
        var dom = vc.dom(element);

        this.options = {
            options: [],
            caption: '',
            text: '',
            value: ''
        };

        this.update = function(options) {
            if (dom.tag() !== 'select') {
                vc.utils.throwForElement(element, 'The options binding can only be bound to select list.');
            }

            if (typeof options.caption !== 'undefined') {
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