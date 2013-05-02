(function() {
    vc.values.string = {
        options: {
            value: ''
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = '' + value;
        }
    };
})();