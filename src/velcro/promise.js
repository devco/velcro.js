(function() {
    vc.Promise = vc.Class.extend({
        _executed: false,
        _value: null,
        _reason: null,
        _state: 'pending',

        init: function() {
            this._fulfilledHandlers = [];
            this._rejectedHandlers = [];
        },

        then: function(onFulfilled, onRejected) {
            if (typeof onFulfilled === 'function') {
                this._fulfilledHandlers.push(onFulfilled);
            }

            if (typeof onRejected === 'function') {
                this._rejectedHandlers.push(onRejected);
            }

            return handler.call(this);
        },

        fulfill: function(callback) {
            var $this = this;

            if (this._executed) {
                throw 'A promise may only be fulfilled once.';
            }

            this._executed = true;

            setTimeout(function() {
                try {
                    $this._value = callback();
                    $this._state = 'fulfilled';
                } catch (error) {
                    $this._reason = error;
                    $this._state = 'rejected';
                }

                handler.call($this);
            }, 1);

            return this;
        }
    });

    function handler() {
        var $this = this;

        setTimeout(function() {
            switch ($this._state) {
                case 'fulfilled':
                    for (var a = 0; a < $this._fulfilledHandlers.length; a++) {
                        $this._fulfilledHandlers[a]($this._value);
                    }
                break;
                case 'rejected':
                    for (var b = 0; b < $this._rejectedHandlers.length; b++) {
                        $this._rejectedHandlers[b]($this._reason);
                    }
                break;
            }

            if ($this._state !== 'pending') {
                $this._fulfilledHandlers = [];
                $this._rejectedHandlers = [];
            }
        }, 1);

        return this;
    }
})();