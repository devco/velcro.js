(function() {
    vc.Value.Boolean = vc.Value.extend({
        value: false,
        set: function(value) {
            this.value = value ? true : false;
        }
    });
})();