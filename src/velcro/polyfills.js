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
})();