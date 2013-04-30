(function() {
    vc.bindings.vc.each = function(app, element) {
        var container = element.parentNode;
        var clones = [];
        var dom = vc.dom(element).attr('data-vc-each', '');
        var reference = document.createComment('each placeholder');
        var template = dom.html();

        element.parentNode.insertBefore(reference, element);
        dom.destroy();

        this.options = {
            as: false
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
                var context = vc.utils.isObject(value) ? value : {};

                context['$index'] = key;
                context['$data']  = value;

                if (options.as) {
                    context[options.as] = value;
                }

                var clone = vc.dom(template).raw();
                app.bind(clone, context);
                clones.push(clone);
                container.insertBefore(clone, reference);

                delete context['$index'];
                delete context['$data'];

                if (options.as) {
                    delete context[options.as];
                }
            }
        };
    };
})();