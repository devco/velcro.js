(function() {
    velcro.Value.Boolean = velcro.Value.extend({
        value: false,
        set: function(value) {
            this.value = value ? true : false;
        }
    });
})();