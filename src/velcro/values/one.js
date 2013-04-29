(function() {
    vc.Value.One = vc.Value.extend({
        model: vc.Model,
        init: function(owner) {
            this.value = new this.model();
            this.value._parent = owner;
        },
        set: function(data) {
            this.value.from(data);
        }
    });
})();