(function() {
    var extending  = false;
    var classes    = [];
    var extensions = {};

    velcro.Class = function() {};
    velcro.Class.extend = function(definition) {
        var $this  = this;
        var Child  = createConstructor();
        var extend = arguments.callee;

        registerHierarchy();
        applyPrototype();
        applyDefinition(this, Child, arguments.callee, definition);

        return Child;


        function applyPrototype() {
            extending = true;
            Child.prototype = new $this();
            extending = false;
        }

        function applyDefinition() {
            Child.extend = extend;

            Child.isSubClassOf = function(Ancestor) {
                var Parent = extensions[classes.indexOf(Child)];
                return Parent === velcro.Class || Parent === Ancestor || Parent.isSubClassOf(Ancestor);
            };

            for (var member in definition) {
                if (typeof Child.prototype[member] === 'function') {
                    Child.prototype[member] = createProxy(member);
                } else {
                    Child.prototype[member] = definition[member];
                }
            }

            Child.prototype.constructor = Child;
        }

        function createProxy(method) {
            return (function(method, fn) {
                return function() {
                    var tmp = this.$super;

                    this.$super = $this.prototype[method];

                    var ret = fn.apply(this, arguments);

                    this.$super = tmp;

                    return ret;
                };
            })(method, definition[method]);
        }

        function registerHierarchy() {
            classes.push(Child);
            extensions[classes.indexOf(Child)] = $this;
        }
    };

    function createConstructor() {
        return function() {
            if (!extending && typeof this.init === 'function') {
                this.init.apply(this, arguments);
            }
        };
    }
})();