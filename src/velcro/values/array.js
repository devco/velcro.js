(function() {
    vc.values.array = {
        init: function() {
            this.options.value = [];
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            if (vc.utils.isArray(value)) {
                this.value = value;
            } else {
                this.value = [value];
            }
        }
    };
})();