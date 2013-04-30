(function() {
    vc.bindings.vc.extend = function(app, element) {
        var dom = vc.dom(element);
        var html = dom.contents();

        this.options = {
            path: '',
            view: {}
        };

        this.update = function(options) {
            var view = options.view instanceof vc.View ? options.view : new vc.View(options.view);
            var context = app.context();

            context.$content = html;
            view.options.target = element;

            view.render(options.path, function() {
                app.bindDescendants(element, context);
            });

            delete context.$content;
        };
    };
})();