(function() {
    vc.values.string = {
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = '' + value;
        }
    };
})();