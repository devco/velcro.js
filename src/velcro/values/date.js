(function() {
    vc.values.date = {
        init: function() {
            this.value = new Date();
        },
        get: function() {
            return ths.value;
        },
        set: function(value) {
            this.value = value instanceof Date ? value : new Date(value);
        }
    };
})();