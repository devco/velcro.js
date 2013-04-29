(function() {
    vc.Value.Array = vc.Value.extend({
        init: function() {
            this.value = [];
        },
        set: function(value) {
            if (vc.utils.isArray(value)) {
                this.value = value;
            } else {
                this.value = [value];
            }
        }
    });
})();