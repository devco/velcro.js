(function() {
    velcro.Value.String = velcro.Value.extend({
        set: function(value) {
            this.value = '' + value;
        }
    });
})();