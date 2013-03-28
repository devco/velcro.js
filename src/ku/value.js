ku.value = function(options) {
    var func = function(value) {
        if (arguments.length === 0) {
            value = func.getter.call(func.owner);

            if (ku.utils.canBeObserved(value)) {
                value.__ku_observer = func;
            }

            return value;
        } else {
            func.setter.call(func.owner, value);
            func.publish();
            return func.owner;
        }
    };

    if (!options) {
        options = {};
    }

    if (typeof options.getter !== 'function') {
        options.getter = function() {
            return _value;
        };
    }

    if (typeof options.setter !== 'function') {
        options.setter = function(value) {
            _value = value;
        };
    }

    var _value       = options.value;
    var _subscribers = [];

    func.owner  = options.owner;
    func.getter = options.getter;
    func.setter = options.setter;

    func.subscribe = function(callback) {
        _subscribers.push(callback);
        return func;
    };

    func.unsubscribe = function(callback) {
        each(_subscribers, function(index, subscriber) {
            if (callback === subscriber) {
                _subscribers.splice(index, 1);
                return;
            }
        });

        return func;
    };

    func.publish = function() {
        each(_subscribers, function(index, subscriber) {
            subscriber(_value);
        });
    };

    return func;
};