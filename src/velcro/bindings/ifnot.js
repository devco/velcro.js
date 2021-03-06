(function() {
    vc.bindings.vcIfnot = function(app, element) {
        var container = element.parentNode;
        var context = app.context();
        var el = vc.dom(element).attr('vc-ifnot', '');
        var html = el.html();
        var placeholder = document.createComment('ifnot placeholder');
        var inserted = false;

        container.insertBefore(placeholder, element);
        el.destroy();

        this.update = function(options) {
            if (!test(options.test)) {
                inserted = vc.dom(html);
                container.insertBefore(inserted.raw(), placeholder);
                app.bind(inserted.raw(), context);
            } else if (inserted) {
                inserted.destroy();
                inserted = false;
            }
        };
    };

    function test(expr) {
        if (expr instanceof vc.Collection) {
            return expr.length > 0;
        }

        return expr;
    }
})();