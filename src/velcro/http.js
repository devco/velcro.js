Velcro.Http = function(options) {
    this.before  = new Velcro.Event();
    this.after   = new Velcro.Event();
    this.success = new Velcro.Event();
    this.error   = new Velcro.Event();
    this.options = Velcro.utils.merge({
        async: true,
        headers: {},
        parsers: { 'application/json': Velcro.utils.parseJson },
        prefix: '',
        suffix: ''
    }, options);

    return this;
};

Velcro.Http.prototype = {
    'delete': function(options) {
        return this.request(Velcro.utils.merge(options, {
            type: 'delete'
        }));
    },

    get: function(options) {
        return this.request(Velcro.utils.merge(options, {
            type: 'get'
        }));
    },

    head: function(options) {
        return this.request(Velcro.utils.merge(options, {
            type: 'head'
        }));
    },

    options: function(options) {
        return this.request(Velcro.utils.merge(options, {
            type: 'options'
        }));
    },

    patch: function(options) {
        return this.request(Velcro.utils.merge(options, {
            type: 'patch'
        }));
    },

    post: function(options) {
        return this.request(Velcro.utils.merge(options, {
            type: 'post'
        }));
    },

    put: function(options) {
        return this.request(Velcro.utils.merge(options, {
            type: 'put'
        }));
    },

    request: function(options) {
        var $this   = this;
        var request = createXmlHttpRequest();

        options = Velcro.utils.merge({
            type: 'GET',
            data: {},
            success: function(){},
            error: function(){},
            before: function(){},
            after: function(){}
        }, options);

        options.type = options.type.toUpperCase();

        if (options.data instanceof Velcro.Model) {
            options.data = options.data.raw();
        }

        if (Velcro.utils.isObject(options.data)) {
            options.data = this.serialize(options.data);
        }

        if (options.data) {
            if (options.type === 'GET') {
                options.url += '?' + options.data;
            } else {
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
        }

        request.open(options.type, this.options.prefix + options.url + this.options.suffix, this.options.async);

        for (var header in this.options.headers) {
            request.setRequestHeader(header, this.options.headers[header]);
        }

        request.onreadystatechange = function () {
            if (request.readyState !== 4) {
                return;
            }

            if (request.status !== 200 && request.status !== 304) {
                options.error.call(options.error, request);
                $this.error.trigger(request);
                options.after.call(options.after, request);
                $this.after.trigger(request);
                return;
            }

            var response = request.responseText;
            var headers  = request.getAllResponseHeaders();

            if (typeof headers['Content-Type'] === 'string' && typeof $this.options.parsers[headers['Content-Type']] === 'function') {
                response = $this.options.parsers[headers['Content-Type']](response);
            } else if (typeof $this.options.headers.Accept === 'string' && typeof $this.options.parsers[$this.options.headers.Accept] === 'function') {
                response = $this.options.parsers[$this.options.headers.Accept](response);
            }

            options.success.call(options.success, response);
            $this.success.trigger(response);
            options.after.call(options.after, request);
            $this.after.trigger(request);
        };

        options.before.call(options.before, request);
        this.before.trigger(request);

        if (options.type === 'GET') {
            request.send();
        } else {
            request.send(options.data);
        }

        return this;
    },

    serialize: function(obj, prefix) {
        var str = [];

        for (var p in obj) {
            var k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];
            str.push(typeof v === 'object' ? this.serialize(v, k) : encodeURIComponent(k) + '=' + encodeURIComponent(v));
        }

        return str.join('&');
    }
};

function createXmlHttpRequest() {
    var request   = false;
    var factories = [
        function () { return new XMLHttpRequest(); },
        function () { return new ActiveXObject('Msxml2.XMLHTTP'); },
        function () { return new ActiveXObject('Msxml3.XMLHTTP'); },
        function () { return new ActiveXObject('Microsoft.XMLHTTP'); }
    ];

    for (var i = 0; i < factories.length; i++) {
        try {
            request = factories[i]();
        } catch (e) {
            continue;
        }
    }

    if (!request) {
        throw 'An XMLHttpRequest could not be generated.';
    }

    return request;
}