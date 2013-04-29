(function() {
    vc.values['default'] = {
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = value;
        }
    };
})();