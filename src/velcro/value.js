(function() {
    velcro.value = function(name, proto) {
        var value;

        if (typeof name === 'string') {
            name = name.charAt(0).toUpperCase() + name.substring(1);

            if (typeof velcro.Value[name] === 'undefined') {
                throw 'The value "' + name + '" is not a registered value type. To register this value use `velcro.Value.' + name + ' = velcro.Value.extend(proto)`.';
            }

            if (proto) {
                value = velcro.Value[name].extend(proto);
            } else {
                value = velcro.Value[name];
            }
        } else if (typeof name === 'object') {
            value = velcro.Value.extend(name);
        } else {
            value = velcro.Value;
        }

        return function(owner) {
            var inst = new value(owner);
            var func = function(value) {
                if (arguments.length) {
                    this.set(value);
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

    velcro.value.isWrapped = function(comp) {
        return typeof comp === 'function' && comp.toString() === velcro.value().toString();
    };

    velcro.value.isUnwrapped = function(comp) {
        return typeof comp === 'function' && comp.constructor.prototype instanceof velcro.Value;
    };

    velcro.Value = velcro.Class.extend({
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