(function() {
    vc.Value.String = vc.Value.extend({
        set: function(value) {
            this.value = '' + value;
        }
    });
})();