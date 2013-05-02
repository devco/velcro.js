(function() {
    vc.values['float'] = {
        options: {
            value: 0
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = parseFloat(value);
        }
    };
})();