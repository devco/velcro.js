(function() {
    Velcro.Class = function() {};

    var extending  = false;
    var classes    = [];
    var extensions = {};

    Velcro.Class.extend = function(definition) {
        var Child = createChild();
        register(this, Child);
        applyPrototype(this, Child);
        applyDefinition(this, Child, arguments.callee, definition);
        return Child;
    };

    function createChild() {
        return function() {
            if (!extending && typeof this.init === 'function') {
                this.init.apply(this, arguments);
            }
        };
    }

    function applyPrototype(Parent, Child) {
        extending = true;
        Child.prototype = new Parent();
        extending = false;
    }

    function applyDefinition(Parent, Child, extend, definition) {
        Child.extend = extend;

        Child.isSubClassOf = function(Ancestor) {
            var Parent = extensions[classes.indexOf(Child)];
            return Parent === Velcro.Class || Parent === Ancestor || Parent.isSubClassOf(Ancestor);
        };

        for (var i in definition) {
            if (typeof Child.prototype[i] === 'function') {
                Child.prototype[i] = createProxy(Parent.prototype, definition, i);
            } else {
                Child.prototype[i] = definition[i];
            }
        }

        Child.prototype.constructor = Child;
    }

    function createProxy(prototype, definition, name) {
        return (function(name, fn) {
            return function() {
                var tmp = this.$super;

                this.$super = prototype[name];

                var ret = fn.apply(this, arguments);

                this.$super = tmp;

                return ret;
            };
        })(name, definition[name]);
    }

    function register(Parent, Child) {
        classes.push(Child);
        extensions[classes.indexOf(Child)] = Parent;
    }
})();