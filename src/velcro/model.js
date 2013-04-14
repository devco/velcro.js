(function() {
    Velcro.Model = Velcro.Class.extend({
        _observer: null,

        _parent: null,

        init: function(data) {
            defineIfNotDefined(this);
            applyDefinition(this);
            this.from(data);
        },

        parent: function(parent) {
            return this._parent;
        },

        clone: function() {
            return new this.$self(this.to());
        },

        each: function(fn) {
            var def = this.$self.definition;

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

            if (obj instanceof Velcro.Model) {
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

                if (out[name] instanceof Velcro.Model || out[name] instanceof Velcro.Collection) {
                    out[name] = out[name].to();
                }
            });

            return out;
        }
    });

    function defineIfNotDefined(obj) {
        if (!obj.$self.definition) {
            define(obj);
        }
    }

    function define(obj) {
        initDefinition(obj);
        defineCollection(obj);
        definePrototype(obj);
    }

    function initDefinition(obj) {
        obj.$self.definition = {
            relations: {},
            properties: {},
            computed: {},
            methods: {}
        };
    }

    function defineCollection(obj) {
        obj.$self.Collection = Velcro.Collection.extend({
            init: function(data) {
                this.$super(obj.$self, data);
            }
        });
    }

    function definePrototype(obj) {
        for (var i in obj) {
            if (typeof Velcro.Model.prototype[i] !== 'undefined') {
                continue;
            }

            var v = obj[i];

            if (Velcro.utils.isClass(v) && (v.isSubClassOf(Velcro.Model) || v.isSubClassOf(Velcro.Collection))) {
                obj.$self.definition.relations[i] = v;
                continue;
            }

            if (typeof v === 'function') {
                var name, type;

                if (i.indexOf('get') === 0) {
                    name = i.substring(3, 4).toLowerCase() + i.substring(4);
                    type = 'get';
                } else if (i.indexOf('set') === 0) {
                    name = i.substring(3, 4).toLowerCase() + i.substring(4);
                    type = 'set';
                }

                if (type) {
                    if (typeof obj.$self.definition.computed[name] === 'undefined') {
                        obj.$self.definition.computed[name] = {};
                    }

                    obj.$self.definition.computed[name][type] = v;
                } else {
                    obj.$self.definition.methods[i] = v;
                }

                continue;
            }

            obj.$self.definition.properties[i] = v;
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
        obj._observer = Velcro.value({
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
        for (var i in obj.$self.definition.relations) {
            var instance = new obj.$self.definition.relations[i]();
            instance._parent = obj;
            obj[i] = instance._observer;
        }
    }

    function applyProperties(obj) {
        for (var i in obj.$self.definition.properties) {
            obj[i] = Velcro.value({
                bind: obj,
                defaultValue: obj.$self.definition.properties[i]
            });
        }
    }

    function applyComputed(obj) {
        for (var i in obj.$self.definition.computed) {
            obj[i] = Velcro.value({
                bind: obj,
                get: obj.$self.definition.computed[i].get ? obj.$self.definition.computed[i].get : generateGetterSetterThrower('getter', i),
                set: obj.$self.definition.computed[i].set ? obj.$self.definition.computed[i].set : generateGetterSetterThrower('setter', i)
            });
        }
    }

    function applyMethods(obj) {
        for (var i in obj.$self.definition.methods) {
            obj[i] = function() {
                obj.$self.definition.methods[i].apply(obj, Array.prototype.slice.call(arguments, 1));
            };
        }
    }

    function generateGetterSetterThrower(type, name) {
        return function() {
            throw 'No ' + type + ' defined for computed property "' + name + '".';
        };
    }
})();