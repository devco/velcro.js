(function() {
    velcro.Value.One = velcro.Value.extend({
        model: velcro.Model,
        init: function(owner) {
            this.value = new this.model();
            this.value._parent = owner;
        },
        set: function(data) {
            this.value.from(data);
        }
    });
})();