(function() {
    velcro.Event = function() {
        this.stack = [];
        return this;
    };

    velcro.Event.prototype = {
        bind: function(cb) {
            this.stack.push(cb);
            return this;
        },

        unbind: function(cb) {
            if (cb) {
                var stack = [];

                for (var i in this.stack) {
                    if (this.stack[i] !== cb) {
                        stack.push(this.stack[i]);
                    }
                }

                this.stack = stack;
            } else {
                this.stack = [];
            }

            return this;
        },

        once: function(cb) {
            var $this = this;

            return this.bind(function() {
                cb.call(cb, arguments);
                $this.unbind(cb);
            });
        },

        trigger: function() {
            return this.triggerArgs(Array.prototype.slice.call(arguments));
        },

        triggerArgs: function(args) {
            for (var i in this.stack) {
                if (this.stack[i].apply(this.stack[i], args) === false) {
                    return false;
                }
            }

            return this;
        }
    };
})();