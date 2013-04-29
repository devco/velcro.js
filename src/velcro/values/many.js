(function() {
    velcro.Value.Many = velcro.Value.extend({
        model: velcro.Model,
        init: function(owner) {
            this.value = new velcro.Collection(this.model);
            this.value._parent = owner;
        },
        set: function(data) {
            this.value.from(data);
        }
    });
})();