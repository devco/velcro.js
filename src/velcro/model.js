(function() {
    vc.Model = vc.Class.extend({
        _observer: vc.value(),

        _parent: null,

        init: function(data) {
            var $this  = this;
            var values = [];

            // For observing overall changes to the model.
            this._observer = this._observer(this);

            // Unwrap all value instances
            for (var a in this) {
                if (vc.value.isWrapped(this[a])) {
                    values.push(this[a] = this[a](this));
                }
            }

            for (var b = 0; b < values.length; b++) {
                values[b].init();
            }

            // So the user doesn't have to worry about calling the parent method and order of operations.
            if (typeof this.setup === 'function') {
                this.setup();
            }

            this.from(data);
        },

        parent: function() {
            return this._parent;
        },

        clone: function() {
            return new this.constructor(this.to());
        },

        each: function(fn) {
            for (var i in this) {
                if (vc.value.isUnwrapped(this[i])) {
                    fn(i, this[i]);
                }
            }

            return this;
        },

        from: function(obj) {
            if (!obj) {
                return this;
            }

            if (obj instanceof vc.Model) {
                obj = obj.to();
            }

            this.each(function(name, value) {
                if (typeof obj[name] !== 'undefined') {
                    value(obj[name]);
                }
            });

            this._observer.publish();

            return this;
        },

        to: function() {
            var out = {};

            this.each(function(name, value) {
                out[name] = value();

                if (out[name] instanceof vc.Model || out[name] instanceof vc.Collection) {
                    out[name] = out[name].to();
                }
            });

            return out;
        }
    });
})();