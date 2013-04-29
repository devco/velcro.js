(function() {
    vc.values.computed = {
        options: {
            use: [],
            read: false,
            write: false
        },
        init: function() {
            var $this = this;

            for (a = 0; a < this.options.use.length; a++) {
                this.owner[this.options.use[a]].subscribe(function() {
                    $this.publish();
                });
            }
        },
        get: function() {
            if (!this.options.read) {
                throw 'Cannot read value because no read function was defined.'
            }

            return this.options.read.call(this.owner);
        },
        set: function(value) {
            if (!this.options.write) {
                throw 'Cannot write value "' + value + '" because no write function was defined.'
            }

            this.options.write.call(this.owner, value);
        }
    };
})();