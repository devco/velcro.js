(function() {
    var extending = false;

    vc.Class = function() {};

    vc.Class.extend = function(definition) {
        var extend = arguments.callee;

        function Child() {
            if (!extending && typeof this.init === 'function') {
                this.init.apply(this, arguments);
            }
        }

        extending = true;
        Child.prototype = new this();
        extending = false;

        Child.extend = extend;

        for (var member in definition) {
            Child.prototype[member] = definition[member];
        }

        return Child.prototype.constructor = Child;
    };
})();