Velcro.Http = function() {
    this.before  = new Velcro.Event();
    this.after   = new Velcro.Event();
    this.success = new Velcro.Event();
    this.error   = new Velcro.Event();
    this.prefix  = '',
    this.suffix  = '',
    this.headers = {};
    this.parsers = {
        'application/json': function(response) {
            try {
                return JSON.parse(response);
            } catch (error) {
                throw 'Error parsing response "' + response + '" with message "' + error + '".';
            }
        }
    };
    return this;
};

Velcro.Http.prototype = {
    'delete': function(options) {
        options.type = 'delete';
        return this.request(options);
    },

    get: function(options) {
        options.type = 'get';
        return this.request(options);
    },

    head: function(options) {
        options.type = 'head';
        return this.request(options);
    },

    options: function(options) {
        options.type = 'options';
        return this.request(options);
    },

    patch: function(options) {
        options.type = 'patch';
        return this.request(options);
    },

    post: function(options) {
        options.type = 'post';
        return this.request(options);
    },

    put: function(options) {
        options.type = 'put';
        return this.request(options);
    },

    request: function(options) {
        var $this   = this;
        var request = createXmlHttpRequest();

        options = {
            type: typeof options.type === 'string' ? options.type.toUpperCase() : 'GET',
            url: options.url,
            data: options.data || {},
            success: options.success || function(){},
            error: options.error || function(){},
            before: options.before || function(){},
            after: options.done || function(){}
        };

        if (Velcro.utils.isModel(options.data)) {
            options.data = options.data.raw();
        }

        if (typeof options.data === 'object') {
            options.data = this.serialize(options.data);
        }

        if (options.data) {
            if (options.type === 'get') {
                options.url += '?' + options.data;
            } else {
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
        }

        request.open(options.type, this.prefix + options.url + this.suffix, true);

        for (var header in this.headers) {
            request.setRequestHeader(header, this.headers[header]);
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

            if (typeof headers['Content-Type'] === 'string' && typeof $this.parsers[headers['Content-Type']] === 'function') {
                response = $this.parsers[headers['Content-Type']](response);
            } else if (typeof $this.headers.Accept === 'string' && typeof $this.parsers[$this.headers.Accept] === 'function') {
                response = $this.parsers[$this.headers.Accept](response);
            }

            options.success.call(options.success, response);
            $this.success.trigger(response);
            options.after.call(options.after, request);
            $this.after.trigger(request);
        };

        options.before.call(options.before, request);
        this.before.trigger(request);
        request.send(options.data);

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