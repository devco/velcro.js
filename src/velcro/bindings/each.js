(function() {
    vc.bindings.vc.each = function(app, element) {
        var context = app.context();
        var container = element.parentNode;
        var clones = [];
        var dom = vc.dom(element).attr('data-vc-each', '');
        var reference = document.createComment('each placeholder');
        var template = dom.html();

        element.parentNode.insertBefore(reference, element);
        dom.destroy();

        this.options = {
            as: false,
            key: false
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
                if (options.as) {
                    if (options.key) {
                        context[options.key] = key;
                    }

                    context[options.as] = value;
                } else {
                    context = vc.utils.merge(value);
                    context.$index = key;
                    context.$data = value;
                }

                var clone = vc.dom(template).raw();
                app.bind(clone, context);
                clones.push(clone);
                container.insertBefore(clone, reference);

                if (options.as) {
                    delete context[options.as];
                    delete context[options.key];
                } else {
                    delete context.$index;
                    delete context.$data;
                }
            }
        };
    };
})();