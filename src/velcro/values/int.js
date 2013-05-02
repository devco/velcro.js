(function() {
    vc.values['int'] = {
        options: {
            value: 0
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = parseInt(value);
        }
    };
})();