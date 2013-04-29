(function() {
    if (typeof Function.prototype.bind !== 'function') {
        Function.prototype.bind = function(oThis) {
            var aArgs   = Array.prototype.slice.call(arguments, 1);
            var fToBind = this;
            var fNOP    = function () {};
            var fBound  = function () {
                return fToBind.apply(
                    this instanceof fNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments))
                );
            };

            fNOP.prototype   = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    if (typeof Object.getPrototypeOf !== 'function') {
        if (typeof 'test'.__proto__ === 'object') {
            Object.getPrototypeOf = function(object) {
                return object.__proto__;
            };
        } else {
            Object.getPrototypeOf = function(object) {
                return object.constructor.prototype;
            };
        }
    }
})();