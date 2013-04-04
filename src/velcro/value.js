velcro.value = function(options) {
    var func = function(value) {
        if (arguments.length === 0) {
            return func.get.call(func.bind);
        } else {
            func.set.call(func.bind, value);
            func.publish();
            return func.bind;
        }
    };

    if (!options) {
        options = {};
    }

    if (typeof options.get !== 'function') {
        options.get = function() {
            return func.value;
        };
    }

    if (typeof options.set !== 'function') {
        options.set = function(value) {
            func.value = value;
        };
    }

    var _subscribers = [];

    func.value = options.value;
    func.bind  = options.bind;
    func.get   = options.get;
    func.set   = options.set;

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
            subscriber(func.value);
        });
        return func;
    };

    return func;
};