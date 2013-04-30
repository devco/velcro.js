(function() {
    vc.bindings.vc.click = function (app, element) {
        this.update = function(options) {
            vc.dom(element).off('click', options.callback).on('click', options.callback);
        };
    }
})();