(function() {
    vc.bindings.vcSubmit = function(app, element) {
        var dom = vc.dom(element);

        this.options = {
            callback: function() {
                vc.utils.throwForElement(element, 'You must specify a callback to the "submit" binding.');
            }
        };

        this.init = function(options, bindings) {
            dom.on('submit', function(e) {
                if (options.callback() !== true) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        };
    };
})();