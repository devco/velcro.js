(function() {
    vc.Value.Many = vc.Value.extend({
        model: vc.Model,
        init: function(owner) {
            this.value = new vc.Collection(this.model);
            this.value._parent = owner;
        },
        set: function(data) {
            this.value.from(data);
        }
    });
})();