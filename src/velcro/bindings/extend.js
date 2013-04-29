(function() {
    vc.bindings.extend = vc.binding({
        options: {
            path: '',
            view: {}
        },

        html: '',

        setup: function(app, element, options) {
            this.html = vc.dom(element).contents();
            this.update(app, element, options);
        },

        update: function(app, element, options) {
            var view    = options.view instanceof vc.View ? options.view : new vc.View(options.view);
            var $this   = this;
            var context = app.context();

            context.$content    = this.html;
            view.options.target = element;

            view.render(options.path, function() {
                app.bindDescendants(element, context);
            });
        }
    });
})();