(function() {
    vc.values.one = {
        options: {
            model: vc.Model
        },
        init: function(owner) {
            this.value = new this.options.model();
            this.value._parent = this.owner;
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value.from(value);
        }
    };
})();