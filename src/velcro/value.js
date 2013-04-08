Velcro.value = function(options) {
    var subs  = [];
    var value = null;

    if (!Velcro.utils.isObject(options)) {
        options = { defaultValue: options };
    }

    options = Velcro.utils.merge({
        defaultValue: null,
        bind: func,
        get: function() {
            return value;
        },
        set: function(newValue) {
            value = newValue;
        }
    }, options);

    value = options.defaultValue;

    function func(newValue) {
        if (arguments.length === 0) {
            return options.get.call(options.bind);
        } else {
            options.set.call(options.bind, newValue);
            func.publish();
            return options.bind;
        }
    }

    func.subscribe = function(callback) {
        subs.push(callback);
        return func;
    };

    func.unsubscribe = function(callback) {
        for (var i = 0; i < subs.length; i++) {
            if (callback === subscriber) {
                subs.splice(index, 1);
                return;
            }
        }
        return func;
    };

    func.publish = function() {
        for (var i = 0; i < subs.length; i++) {
            subs[i](func.value);
        }
        return func;
    };

    return func;
};