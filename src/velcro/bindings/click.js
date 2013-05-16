(function() {
    vc.bindings.vcClick = function (app, element) {
        this.init = function(options) {
            vc.dom(element).on('click', options.callback);
        };
    }
})();