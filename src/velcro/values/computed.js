(function() {
    vc.values.computed = {
        options: {
            use: [],
            read: false,
            write: false
        },
        init: function() {
            var $this = this;
            var use = this.options.use;

            if (typeof use === 'function') {
                use = use.call(this.owner);
            }

            if (typeof use === 'string') {
                use = [use];
            }

            for (a = 0; a < use.length; a++) {
                if (typeof use[a] === 'string') {
                    use[a] = this.owner[use[a]];
                }
            }

            for (b = 0; b < use.length; b++) {
                use[b].subscribe(function() {
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