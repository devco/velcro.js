(function() {
    vc.bindings.vcEach = function(app, element) {
        var context = app.context();
        var container = element.parentNode;
        var clones = [];
        var dom = vc.dom(element).attr('vc-each', '');
        var reference = document.createComment('each placeholder');
        var template = dom.html();

        element.parentNode.insertBefore(reference, element);
        dom.destroy();

        this.options = {
            as: '$data',
            key: '$index'
        };

        this.update = function(options) {
            vc.utils.each(clones, function(index, clone) {
                vc.dom(clone).destroy();
            });

            clones = [];

            if (options.items instanceof vc.Model) {
                options.items.each(function(key, value) {
                    each(key, value());
                });
            } else if (options.items instanceof vc.Collection) {
                options.items.each(each);
            } else {
                vc.utils.each(options.items, each);
            }

            function each(key, value) {
                var childContext = vc.utils.merge(context, value);
                var clone = vc.dom(template).raw();

                childContext[options.key] = key;
                childContext[options.as] = value;

                app.bind(clone, childContext);
                clones.push(clone);
                container.insertBefore(clone, reference);
            }
        };
    };
})();