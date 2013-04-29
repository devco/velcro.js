(function() {
    velcro.Collection = velcro.Class.extend({
        _observer: velcro.value(),

        _parent: null,

        _model: null,

        init: function(Model, data) {
            Array.prototype.push.apply(this, []);

            this._observer = this._observer(this);
            this._model    = Model;

            this.from(data);
        },

        aggregate: function(joiner, fields) {
            var arr = [];

            if (!fields) {
                fields = [joiner];
                joiner = '';
            }

            this.each(function(k, model) {
                var parts = [];

                velcro.utils.each(fields, function(kk, field) {
                    if (typeof model[field] === 'function') {
                        parts.push(model[field]());
                    }
                });

                arr.push(parts.join(joiner));
            });

            return arr;
        },

        at: function(index) {
            return typeof this[index] === 'undefined' ? false : this[index];
        },

        first: function() {
            return this.at(0);
        },

        last: function() {
            return this.at(this.length - 1);
        },

        has: function(index) {
            return typeof this[index] !== 'undefined';
        },

        remove: function(at) {
            at = typeof at === 'number' ? at : this.index(at);

            if (this.has(at)) {
                Array.prototype.splice.call(this, at, 1);
                this._observer.publish();
            }

            return this;
        },

        empty: function() {
            Array.prototype.splice.call(this, 0, this.length);
            this._observer.publish();

            return this;
        },

        prepend: function(item) {
            return this.insert(0, item);
        },

        append: function(item) {
            return this.insert(this.length, item);
        },

        insert: function(at, item) {
            item         = item instanceof velcro.Model ? item : new this._model(item);
            item._parent = this._parent;

            Array.prototype.splice.call(this, at, 0, item);
            this._observer.publish();

            return this;
        },

        replace: function (at, item) {
            item         = item instanceof velcro.Model ? item : new this._model(item);
            item._parent = this._parent;

            Array.prototype.splice.call(this, at, 1, item);
            this._observer.publish();

            return this;
        },

        index: function(item) {
            var index = -1;

            this.each(function(i, it) {
                if (it === item) {
                    index = i;
                    return;
                }
            });

            return index;
        },

        from: function(data) {
            var that = this;

            if (data instanceof velcro.Collection) {
                data = data.to();
            }

            velcro.utils.each(data, function(i, model) {
                if (that.has(i)) {
                    that.replace(i, model);
                } else {
                    that.replace(i, model);
                }
            });

            return this;
        },

        to: function() {
            var out = [];

            this.each(function(i, v) {
                out.push(v.to());
            });

            return out;
        },

        each: function(fn) {
            for (var i = 0; i < this.length; i++) {
                fn(i, this[i]);
            }
            return this;
        },

        find: function(query, limit, page) {
            var collection     = new velcro.Collection(this._model);
            collection._parent = this._parent;

            if (query instanceof velcro.Model) {
                query = query.to();
            }

            if (typeof query === 'object') {
                query = (function(query) {
                    return function() {
                        var that = this,
                            ret  = true;

                        velcro.utils.each(query, function(k, v) {
                            if (typeof that[k] === 'undefined' || that[k]() !== v) {
                                ret = false;
                                return false;
                            }
                        });

                        return ret;
                    };
                })(query);
            }

            this.each(function(i, model) {
                if (limit && page) {
                    var offset = (limit * page) - limit;

                    if (offset < i) {
                        return;
                    }
                }

                if (query.call(model, i)) {
                    collection.append(model);
                }

                if (limit && collection.length === limit) {
                    return false;
                }
            });

            return collection;
        },

        findOne: function(query) {
            return this.find(query, 1).first();
        }
    });

    velcro.collection = function(Model) {
        return velcro.Collection.extend({
            init: function(data) {
                this.$super(Model, data);
            }
        });
    };
})();