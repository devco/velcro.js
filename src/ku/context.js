ku.Context = function(data) {
    this.data   = data || {};
    this.parent = null;
};

ku.Context.prototype = {
    get: function(name) {
        if (this.has(name)) {
            return this.data[name];
        }
    },

    set: function(name, value) {
        this.data[name] = value;
        return this;
    },

    has: function(name, value) {
        return typeof this.data[name] !== 'undefined';
    },

    remove: function(name, value) {
        if (this.has(name)) {
            delete this.data[name];
        }
        return this;
    }
};