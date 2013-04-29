(function() {
    vc.values.many = {
        options: {
            model: vc.Model
        },
        init: function() {
            this.value = new vc.Collection(this.options.model);
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