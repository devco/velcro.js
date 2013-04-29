(function() {
    vc.values.bool = {
        init: function() {
            this.value = false;
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = value ? true : false;
        }
    };
})();