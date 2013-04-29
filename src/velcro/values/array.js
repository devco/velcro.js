(function() {
    velcro.Value.Array = velcro.Value.extend({
        init: function() {
            this.value = [];
        },
        set: function(value) {
            if (velcro.utils.isArray(value)) {
                this.value = value;
            } else {
                this.value = [value];
            }
        }
    });
})();