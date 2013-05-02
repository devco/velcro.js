(function() {
    vc.values.bool = {
        options: {
            value: false
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = value ? true : false;
        }
    };
})();