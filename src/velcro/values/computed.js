(function() {
    vc.Value.Computed = vc.Value.extend({
        use: [],
        model: null,
        init: function(model) {
            var $this = this;

            this.model = model;

            for (i = 0; i < this.use.length; i++) {
                model[this.use[i]].subscribe(function() {
                    //$this.publish();
                });
            }
        },
        get: function() {
            if (!this.read) {
                throw 'Cannot read value because no read function was defined.'
            }

            return this.read.call(this.model);
        },
        set: function(value) {
            if (!this.write) {
                throw 'Cannot write value "' + value + '" because no write function was defined.'
            }

            this.write.call(this.model, value);
        }
    });
})();