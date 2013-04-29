(function() {
    // For registering values to.
    vc.values = {};

    // Returns a function that creates a new value accessor for the specified owner.
    vc.value = function(name, options) {
        if (typeof name === 'object') {
            options = name;
            name    = 'default';
        } else if (!name) {
            name = 'default';
        }

        if (typeof vc.values[name] === 'undefined') {
            throw 'The value "' + name + '" is not registered as a Velcro Value.';
        }

        options = vc.utils.merge(vc.values[name].options, options);

        return function(owner) {
            var interval = false;
            var subs     = [];

            var func = function(newValue) {
                if (arguments.length) {
                    func.set(newValue);
                    func.publish();
                    return func.owner;
                }

                return func.get();
            };

            func.options = options;
            func.owner   = owner;
            func.value   = null;

            func.init = function() {
                if (typeof vc.values[name].init === 'function') {
                    vc.values[name].init.call(this);
                }

                if (typeof this.options.value !== 'undefined') {
                    this.set(this.options.value);
                }
            };

            func.get = function() {
                if (typeof vc.values[name].get === 'function') {
                    return vc.values[name].get.call(this);
                }
            };

            func.set = function(newValue) {
                if (typeof vc.values[name].set === 'function') {
                    vc.values[name].set.call(this, newValue);
                }
            };

            func.subscribe = function(callback) {
                subs.push(callback);
                return this;
            };

            func.unsubscribe = function(callback) {
                for (var i = 0; i < subs.length; i++) {
                    if (callback === subscriber) {
                        subs.splice(index, 1);
                        return;
                    }
                }

                return this;
            };

            func.publish = function() {
                for (var i = 0; i < subs.length; i++) {
                    subs[i]();
                }

                return this;
            };

            func.updateEvery = function(ms) {
                var $this = this;

                interval = setInterval(function() {
                    $this.publish();
                }, ms);

                return this;
            };

            func.stopUpdating = function() {
                if (interval) {
                    clearInterval(interval);
                }

                return this;
            };

            return func;
        };
    };

    vc.value.isWrapped = function(comp) {
        return typeof comp === 'function' && comp.toString() === vc.value().toString();
    };

    vc.value.isUnwrapped = function(comp) {
        return typeof comp === 'function' && comp.toString() === vc.value()().toString();
    };
})();