
(function() {
    Velcro.Model = Velcro.Class.extend({
        $observer: null,

        $parent: null,

        init: function(data) {
            defineIfNotDefined(this);
            applyDefinition(this);
            this.from(data);
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

            this.$observer.publish();

            return this;
        },

        to: function() {
            var out = {};

            this.each(function(name, value) {
                out[name] = value();
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
            computed: {}
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

                if (!type) {
                    continue;
                }

                if (typeof obj.$self.definition.computed[name] === 'undefined') {
                    obj.$self.definition.computed[name] = {};
                }

                obj.$self.definition.computed[name][type] = v;

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
    }

    function applyObserver(obj) {
        obj.$observer = Velcro.value({
            bind: obj,
            defaultValue: obj,
            set: function(value) {
                this.from(value);
            }
        });
    }

    function applyRelations(obj) {
        for (var i in obj.$self.definition.relations) {
            var instance     = new obj.$self.definition.relations[i]();
            instance.$parent = obj;
            obj[i]           = instance.$observer;
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

    function generateGetterSetterThrower(type, name) {
        return function() {
            throw 'No ' + type + ' defined for computed property "' + name + '".';
        };
    }
})();