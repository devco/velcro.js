(function() {
    velcro.Model = velcro.Class.extend({
        _observer: null,

        _parent: null,

        init: function(data) {
            defineIfNotDefined(this);
            applyDefinition(this);

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
            var def = this.constructor.definition;

            for (var a in def.relations) {
                fn(a, this[a]);
            }

            for (var b in def.properties) {
                fn(b, this[b]);
            }

            for (var c in def.computed) {
                fn(c, this[c]);
            }

            return this;
        },

        from: function(obj) {
            if (!obj) {
                return this;
            }

            if (obj instanceof velcro.Model) {
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

                if (out[name] instanceof velcro.Model || out[name] instanceof velcro.Collection) {
                    out[name] = out[name].to();
                }
            });

            return out;
        }
    });

    velcro.model = function(def) {
        return velcro.Model.extend(def);
    };

    function defineIfNotDefined(obj) {
        if (!obj.constructor.definition) {
            define(obj);
        }
    }

    function define(obj) {
        initDefinition(obj);
        definePrototype(obj);
    }

    function initDefinition(obj) {
        obj.constructor.definition = {
            relations: {},
            properties: {},
            computed: {},
            methods: {}
        };
    }

    function definePrototype(obj) {
        for (var i in obj) {
            if (typeof velcro.Model.prototype[i] !== 'undefined') {
                continue;
            }

            var v = obj[i];

            if (velcro.utils.isClass(v) && (v.isSubClassOf(velcro.Model) || v.isSubClassOf(velcro.Collection))) {
                obj.constructor.definition.relations[i] = v;
                continue;
            }

            if (typeof v === 'function') {
                var name = false;
                var type = false;

                if (i.indexOf('get') === 0) {
                    name = i.substring(3, 4).toLowerCase() + i.substring(4);
                    type = 'get';
                } else if (i.indexOf('set') === 0) {
                    name = i.substring(3, 4).toLowerCase() + i.substring(4);
                    type = 'set';
                }

                if (type) {
                    if (typeof obj.constructor.definition.computed[name] === 'undefined') {
                        obj.constructor.definition.computed[name] = {};
                    }

                    obj.constructor.definition.computed[name][type] = v;
                } else {
                    obj.constructor.definition.methods[i] = v;
                }

                continue;
            }

            obj.constructor.definition.properties[i] = v;
        }
    }

    function applyDefinition(obj) {
        applyObserver(obj);
        applyRelations(obj);
        applyProperties(obj);
        applyComputed(obj);
        applyMethods(obj);
    }

    function applyObserver(obj) {
        obj._observer = velcro.value({
            bind: obj,
            get: function() {
                return this;
            },
            set: function(value) {
                this.from(value);
            }
        });
    }

    function applyRelations(obj) {
        for (var i in obj.constructor.definition.relations) {
            var instance = new obj.constructor.definition.relations[i]();
            instance._parent = obj;
            obj[i] = instance._observer;
        }
    }

    function applyProperties(obj) {
        for (var i in obj.constructor.definition.properties) {
            obj[i] = velcro.value({
                bind: obj,
                value: obj.constructor.definition.properties[i]
            });
        }
    }

    function applyComputed(obj) {
        for (var i in obj.constructor.definition.computed) {
            var options = {
                bind: obj
            };

            if (typeof obj.constructor.definition.computed[i].get === 'function') {
                options.get = obj.constructor.definition.computed[i].get;
            }

            if (typeof obj.constructor.definition.computed[i].set === 'function') {
                options.set = obj.constructor.definition.computed[i].set;
            }

            obj[i] = velcro.value(options);
        }
    }

    function applyMethods(obj) {
        for (var i in obj.constructor.definition.methods) {
            obj[i] = (function(method) {
                return function() {
                    return method.apply(obj, Array.prototype.slice.call(arguments));
                };
            })(obj.constructor.definition.methods[i]);
        }
    }

    function generateGetterSetterThrower(type, name) {
        return function() {
            throw 'No ' + type + ' defined for computed property "' + name + '".';
        };
    }
})();