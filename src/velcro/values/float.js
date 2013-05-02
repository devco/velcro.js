(function() {
    vc.values['float'] = {
        init: function() {
            this.value = 0;
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = parseFloat(value);
        }
    };
})();