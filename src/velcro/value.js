(function() {
    vc.value = function(name, proto) {
        var value;

        if (typeof name === 'string') {
            name = name.charAt(0).toUpperCase() + name.substring(1);

            if (typeof vc.Value[name] === 'undefined') {
                throw 'The value "' + name + '" is not a registered value type. To register this value use `vc.Value.' + name + ' = vc.Value.extend(proto)`.';
            }

            if (proto) {
                value = vc.Value[name].extend(proto);
            } else {
                value = vc.Value[name];
            }
        } else if (typeof name === 'object') {
            value = vc.Value.extend(name);
        } else {
            value = vc.Value;
        }

        return function(owner) {
            var inst = new value(owner);
            var func = function(newValue) {
                if (arguments.length) {
                    this.set(newValue);
                    this.publish();
                    return owner;
                }

                return this.get();
            }.bind(inst);

            for (var i in inst) {
                func[i] = inst[i];
            }

            return func;
        };
    };

    vc.value.isWrapped = function(comp) {
        return typeof comp === 'function' && comp.toString() === vc.value().toString();
    };

    vc.value.isUnwrapped = function(comp) {
        return typeof comp === 'function' && comp.constructor.prototype instanceof vc.Value;
    };

    vc.Value = vc.Class.extend({
        interval: false,

        subs: [],

        value: null,

        get: function() {
            return this.value;
        },

        set: function(value) {
            this.value = value;
        },

        subscribe: function(callback) {
            this.subs.push(callback);
            return this;
        },

        unsubscribe: function(callback) {
            for (var i = 0; i < this.subs.length; i++) {
                if (callback === subscriber) {
                    this.subs.splice(index, 1);
                    return;
                }
            }

            return this;
        },

        publish: function() {
            for (var i = 0; i < this.subs.length; i++) {
                this.subs[i]();
            }

            return this;
        },

        updateEvery: function(ms) {
            var $this = this;

            this.interval = setInterval(function() {
                $this.publish();
            }, ms);

            return this;
        },

        stopUpdating: function() {
            if (this.interval) {
                clearInterval(this.interval);
            }

            return this;
        }
    });
})();