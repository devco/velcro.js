(function() {
    vc.values['int'] = {
        init: function() {
            this.value = 0;
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = parseInt(value);
        }
    };
})();