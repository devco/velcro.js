(function() {
    vc.Http = vc.Class.extend({
        init: function(options) {
            this.before  = new vc.Event();
            this.after   = new vc.Event();
            this.success = new vc.Event();
            this.error   = new vc.Event();
            this.options = vc.utils.merge({
                async: true,
                cache: false,
                headers: {},
                parsers: { 'application/json': vc.utils.parseJson },
                prefix: '',
                suffix: ''
            }, options);

            return this;
        },

        'delete': function(options) {
            return this.request(vc.utils.merge(options, {
                type: 'delete'
            }));
        },

        get: function(options) {
            return this.request(vc.utils.merge(options, {
                type: 'get'
            }));
        },

        head: function(options) {
            return this.request(vc.utils.merge(options, {
                type: 'head'
            }));
        },

        options: function(options) {
            return this.request(vc.utils.merge(options, {
                type: 'options'
            }));
        },

        patch: function(options) {
            return this.request(vc.utils.merge(options, {
                type: 'patch'
            }));
        },

        post: function(options) {
            return this.request(vc.utils.merge(options, {
                type: 'post'
            }));
        },

        put: function(options) {
            return this.request(vc.utils.merge(options, {
                type: 'put'
            }));
        },

        request: function(options) {
            var $this   = this;
            var request = createXmlHttpRequest();
            var promise = new vc.Promise();

            options = vc.utils.merge({
                url: '',
                type: 'GET',
                data: {},
                success: function(){},
                error: function(){},
                before: function(){},
                after: function(){}
            }, options);

            var url  = this.options.prefix + options.url + this.options.suffix;
            var type = options.type.toUpperCase();
            var data = options.data;

            if (data instanceof vc.Model) {
                data = data.raw();
            }

            if (!this.options.cache) {
                data['_' + new Date().getTime()] = '1';
            }

            if (vc.utils.isObject(data)) {
                data = this.serialize(data);
            }

            if (data && options.type === 'GET') {
                url += '?' + data;
            }

            request.open(type, url, this.options.async);

            if (data && options.type !== 'GET') {
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }

            for (var header in this.options.headers) {
                request.setRequestHeader(header, this.options.headers[header]);
            }

            request.onreadystatechange = function() {
                if (request.readyState !== 4) {
                    return;
                }

                promise.fulfill(function() {
                    if (request.status !== 200 && request.status !== 304) {
                        options.error.call(options.error, request);
                        $this.error.trigger(request);
                        options.after.call(options.after, request);
                        $this.after.trigger(request);
                        throw 'Error ' + request.status + ': ' + request.statusText;
                    }

                    var response = request.responseText;
                    var headers = request.getAllResponseHeaders();
                    var parser = false;

                    if (typeof headers['Content-Type'] === 'string' && typeof $this.options.parsers[headers['Content-Type']] === 'function') {
                        parser = $this.options.parsers[headers['Content-Type']];
                    } else if (typeof $this.options.headers.Accept === 'string' && typeof $this.options.parsers[$this.options.headers.Accept] === 'function') {
                        parser = $this.options.parsers[$this.options.headers.Accept];
                    }

                    if (parser) {
                        try {
                            response = parser(response);
                        } catch (e) {
                            throw 'Cannot parse response from "' + url + '" with message: ' + e;
                        }
                    }

                    options.success.call(options.success, response);
                    $this.success.trigger(response);
                    options.after.call(options.after, request);
                    $this.after.trigger(request);

                    return response;
                });
            };

            options.before.call(options.before, request);
            this.before.trigger(request);

            if (type === 'GET') {
                request.send();
            } else {
                request.send(data);
            }

            return promise;
        },

        serialize: function(obj, prefix) {
            var str = [];

            for (var p in obj) {
                var k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];
                str.push(typeof v === 'object' ? this.serialize(v, k) : encodeURIComponent(k) + '=' + encodeURIComponent(v));
            }

            return str.join('&');
        }
    });

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
})();