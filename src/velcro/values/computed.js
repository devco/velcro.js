(function() {
    vc.values.computed = {
        options: {
            use: [],
            read: function(){},
            write: function(){}
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
            return this.options.read.call(this.owner);
        },
        set: function(value) {
            this.options.write.call(this.owner, value);
        }
    };
})();