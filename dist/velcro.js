!function(factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        factory(module.exports || exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory(window.vc = {});
    }
}(function(vc) {
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
(function() {
    vc.utils = {
        each: function(items, fn) {
            items = items || [];

            if (typeof items === 'string') {
                items = [items];
            }

            if (typeof items.length === 'number') {
                for (var i = 0; i < items.length; i++) {
                    if (fn(i, items[i]) === false) {
                        return;
                    }
                }
            } else {
                for (var x in items) {
                    if (fn(x, items[x]) === false) {
                        return;
                    }
                }
            }
        },

        fnCompare: function(fn, str) {
            if (!fn) {
                return false;
            }

            if (typeof fn === 'object' && fn.constructor) {
                fn = fn.constructor;
            }

            if (typeof fn === 'function') {
                fn = fn.toString();
            }

            return fn === str;
        },

        isArray: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

        isInstance: function(obj) {
            return obj && typeof obj.constructor === 'function';
        },

        isObject: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Object]';
        },

        isValue: function(value) {
            return typeof value === 'function' && value.toString() === vc.value().toString();
        },

        merge: function() {
            var merged = {};

            for (var i = 0; i < arguments.length; i++) {
                var param = arguments[i];

                if (!vc.utils.isObject(param)) {
                    continue;
                }

                for (var ii in param) {
                    var value = param[ii];

                    if (typeof merged[ii] === 'undefined') {
                        merged[ii] = value;
                        continue;
                    }

                    if (vc.utils.isInstance(value)) {
                        merged[ii] = value;
                        continue;
                    }

                    if (vc.utils.isObject(merged[ii]) && vc.utils.isObject(value)) {
                        merged[ii] = vc.utils.merge(merged[ii], value);
                        continue;
                    }

                    merged[ii] = value;
                }
            }

            return merged;
        },

        parseBinding: function(json, context) {
            var code = '';

            for (var i in context) {
                code += 'var ' + i + '=__context[\'' + i + '\'];';
            }

            code += 'return {' + json + '};';

            try {
                return new Function('__context', code)(context);
            } catch (e) {
                throw 'Error parsing binding "' + json + '" with message: "' + e + '"';
            }
        },

        parseJson: function(json) {
            if (typeof JSON === 'undeinfed' || typeof JSON.parse !== 'function') {
                throw 'Unable to parse JSON string "' + json + '" because no JSON parser is available via JSON.parse().';
            }

            try {
                return JSON.parse(json);
            } catch (error) {
                throw 'Error parsing response "' + response + '" with message "' + error + '".';
            }
        },

        extract: function(obj) {
            var options = {};

            vc.utils.each(obj, function(name, value) {
                if (vc.utils.isValue(value)) {
                    options[name] = value();
                } else {
                    options[name] = value;
                }
            });

            return options;
        },

        throwForElement: function(element, message) {
            throw message + "\n" + vc.dom(element).html();
        }
    };
})();
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
(function() {
    vc.Dom = vc.Class.extend({
        element: null,

        init: function(element) {
            if (element instanceof vc.Dom) {
                element = element.raw();
            } else if (typeof element === 'string') {
                element = fromHtml(element);
            }

            this.element = element;
        },

        raw: function() {
            return this.element;
        },

        css: function(classes) {
            if (arguments.length === 0) {
                var split = this.attr('class').split(/\s+/);
                var temp = {};

                for (var a = 0; a < split.length; a++) {
                    temp[split[a]] = true;
                }

                return temp;
            }

            var css = [];

            if (typeof classes.length === 'number') {
                for (var b = 0; b < classes.length; b++) {
                    css.push(classes[i]);
                }
            } else {
                for (var c in classes) {
                    if (classes[c]) {
                        if (css.indexOf(c) === -1) {
                            css.push(c);
                        }
                    }
                }
            }

            return this.attr('class', css.join(' ').replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
        },

        attr: function(name, value) {
            if (arguments.length === 1) {
                if (this.element.getAttribute) {
                    return this.element.getAttribute(name) || '';
                }

                if (typeof this.element[name] === 'undefined') {
                    return '';
                }

                return this.element[name] || '';
            }

            if (!value) {
                if (this.element.removeAttribute) {
                    this.element.removeAttribute(name);
                } else {
                    this.element[name] = null;
                }

                return this;
            }

            if (this.element.setAttribute) {
                this.element.setAttribute(name, value);
            } else {
                this.element[name] = value;
            }

            return this;
        },

        on: function(name, callback) {
            var $this = this;

            if (this.element.addEventListener) {
                this.element.addEventListener(name, proxy, false);
            } else if (element.attachEvent) {
                this.element.attachEvent('on' + name, function(e) {
                    proxy.call($this.element, e);
                });
            } else {
                this.element['on' + name] = proxy;
            }

            // Proxies the call to the callback to modify the event object before it
            // passed to the callback so that common functionality can be abstracted.
            function proxy(e) {
                if (!e.preventDefault) {
                    e.preventDefault = function() {
                        e.returnValue = false;
                        return e;
                    };
                }

                if (!e.stopPropagation) {
                    e.stopPropagation = function() {
                        e.cancelBubble = true;
                        return e;
                    };
                }

                if (callback(e) === false) {
                    e.preventDefault();
                }
            }

            return this;
        },

        off: function(name, callback) {
            if (this.element.removeEventListener) {
                this.element.removeEventListener(name, callback, false);
            } else if (this.element.detachEvent) {
                this.element.detachEvent(name, callback);
            } else {
                delete this.element['on' + name];
            }

            return this;
        },

        fire: function(name) {
            var e;

            if (document.createEventObject) {
                e = document.createEventObject();
                this.element.fireEvent(name, e);
            } else {
                e = document.createEvent('Events');
                e.initEvent(name, true, true);
                this.element.dispatchEvent(e);
            }

            return this;
        },

        destroy: function() {
            this.element.parentNode.removeChild(this.element);
            this.element.innerHTML = '';
            delete this.element.attributes;
            delete this.element.childNodes;
            return this;
        },

        html: function() {
            var div = document.createElement(detectParentTagName(this.element.tagName));
            div.appendChild(this.element.cloneNode(true));
            return div.innerHTML;
        },

        contents: function(contents) {
            if (arguments.length) {
                this.element.innerHTML = contents;
                return this;
            }

            return this.element.innerHTML;
        },

        append: function(child) {
            this.element.appendChild(vc.dom(child).raw());
            return this;
        },

        text: function(text) {
            if (arguments.length) {
                this.element.innerText = text;
                return this;
            }

            return this.element.innerText;
        },

        tag: function() {
            return this.element.tagName.toLowerCase();
        }
    });

    vc.dom = function(element) {
        return new vc.Dom(element);
    };

    function fromHtml(html) {
        var comment = html.match(/<!--\s*(.*?)\s*-->/);

        if (comment) {
            return document.createComment(comment[0]);
        }

        var tag = html.match(/^<([^\s>]+)/)[1];
        var div = document.createElement(detectParentTagName(tag));
        div.innerHTML = html;
        var element = div.childNodes[0];
        div.removeChild(element);
        return element;
    }

    function detectParentTagName(tag) {
        var map = {
            colgroup: 'table',
            col: 'colgroup',
            caption: 'table',
            thead: 'table',
            tbody: 'table',
            tfoot: 'table',
            tr: 'tbody',
            th: 'thead',
            td: 'tr'
        };

        tag = tag.toLowerCase();

        if (typeof map[tag] !== 'undefined') {
            return map[tag];
        }

        return 'div';
    }
})();
(function() {
    vc.Event = vc.Class.extend({
        init: function() {
            this.stack = [];
            return this;
        },

        bind: function(cb) {
            this.stack.push(cb);
            return this;
        },

        unbind: function(cb) {
            if (cb) {
                var stack = [];

                for (var i in this.stack) {
                    if (this.stack[i] !== cb) {
                        stack.push(this.stack[i]);
                    }
                }

                this.stack = stack;
            } else {
                this.stack = [];
            }

            return this;
        },

        once: function(cb) {
            var $this = this;

            return this.bind(function() {
                cb.call(cb, arguments);
                $this.unbind(cb);
            });
        },

        trigger: function() {
            return this.triggerArgs(Array.prototype.slice.call(arguments));
        },

        triggerArgs: function(args) {
            for (var i in this.stack) {
                if (this.stack[i].apply(this.stack[i], args) === false) {
                    return false;
                }
            }

            return this;
        }
    });
})();
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

            if (vc.utils.isObject(data)) {
                data = this.serialize(data);
            }

            if (data) {
                if (options.type === 'GET') {
                    url += '?' + data;
                } else {
                    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                }
            }

            if (!this.options.cache) {
                if (data && type === 'GET') {
                    url += '&';
                } else {
                    url += '?';
                }

                url += new Date().getTime();
            }

            request.open(type, url, this.options.async);

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

            if (type === 'GET') {
                request.send();
            } else {
                request.send(data);
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
(function() {
    var bound = [];

    vc.Router = vc.Class.extend({
        init: function(options) {
            this.options = vc.utils.merge({
                app: {},
                state: {},
                view: {}
            }, options);

            this.enter  = new vc.Event();
            this.exit   = new vc.Event();
            this.render = new vc.Event();

            this.params = {};
            this.route  = false;
            this.routes = {};

            this.app   = this.options.app   instanceof vc.App   ? this.options.app   : new vc.App(this.options.app);
            this.state = this.options.state instanceof vc.State ? this.options.state : new vc.State(this.options.state);
            this.view  = this.options.view  instanceof vc.View  ? this.options.view  : new vc.View(this.options.view);

            return this;
        },

        handler: function(execute) {
            execute();
        },

        renderer: function(route, params) {
            var $this   = this;
            var context = route.options.controller.apply(route.options.controller, params);

            if (context instanceof vc.Model) {
            } else {
                context = vc.Model.extend(context);
                context = new context();
            }

            this.view.render(route.options.view, function(view) {
                $this.app.bindDescendants(view.options.target, context);
                $this.render.trigger($this, route, params);
            });
        },

        bind: function() {
            this.unbind();
            bound.push(this);

            if (!('onpopstate' in window) || (!this.state.enabled || (this.state.enabled && !window.location.hash))) {
                this.dispatch();
            }

            return this;
        },

        unbind: function() {
            for (var i = 0; i < bound.length; i++) {
                if (this === bound[i]) {
                    delete bound[i];
                }
            }

            return this;
        },

        set: function(name, route) {
            if (!(route instanceof vc.Route)) {
                route = new vc.Route(vc.utils.merge({
                    controller: typeof route === 'function' ? route : function(){},
                    format: name,
                    match: new RegExp('^' + name + "$"),
                    view: name || 'index'
                }, route));
            }

            this.routes[name] = route;

            return this;
        },

        get: function(name) {
            if (this.has(name)) {
                return this.routes[name];
            }

            throw 'Route "' + name + '" does not exist.';
        },

        has: function(name) {
            return typeof this.routes[name] !== 'undefined';
        },

        remove: function(name) {
            if (this.has(name)) {
                delete this.routes[name];
            }

            return this;
        },

        dispatch: function(request) {
            var $this = this;

            if (typeof request === 'undefined') {
                request = this.state.get();
            }

            for (var i in this.routes) {
                var route  = this.routes[i];
                var params = route.query(request);

                if (typeof params.length !== 'number') {
                    continue;
                }

                if (this.route) {
                    this.exit.trigger(this, this.state.previous, this.route, this.params);
                }

                this.params         = params;
                this.route          = route;
                this.state.previous = request;

                this.enter.trigger(this, request, route, params);
                this.handler(_makeHandler(route, params));
            }

            return this;

            function _makeHandler(route, params) {
                return function() {
                    $this.renderer(route, params);
                };
            }
        },

        go: function(name, params, data) {
            this.state.push(this.get(name).generate(params), data);
            return this;
        },

        generate: function(name, params) {
            return this.get(name).generate(params);
        }
    });



    vc.Route = vc.Class.extend({
        init: function(options) {
            this.options = vc.utils.merge({
                controller: function(){},
                format: '',
                match: /.*/,
                view: false
            }, options);

            return this;
        },

        query: function(request) {
            var params = request.match(this.options.match);

            if (params === null) {
                return false;
            }

            params.shift();

            return params;
        },

        generate: function(params) {
            var format = this.options.format;

            for (var name in params) {
                format = format.replace(new RegExp('\\:' + name, 'g'), params[name]);
            }

            return format;
        }
    });



    var oldState = window.location.hash;
    var interval;
    var isStarted = false;

    vc.State = vc.Class.extend({
        previous: false,

        enabled: false,

        init: function(options) {
            this.options = vc.utils.merge({
                scroll: false
            });

            this.states = {};

            vc.State.start();

            return this;
        },

        get: function() {
            if (this.enabled && window.history.pushState) {
                return removeHostPart(window.location.href);
            }
            return window.location.hash.substring(1);
        },

        push: function(uri, data, description) {
            if (this.enabled && window.history.pushState) {
                window.history.pushState(data, description, uri || '.');
                dispatch();
            } else {
                updateHash(uri, this.options.scroll);
            }

            this.states[uri] = data;

            return this;
        },

        data: function(state) {
            state = state || this.get();

            if (typeof this.states[state] === 'undefined') {
                return null;
            }

            return this.states[state];
        }
    });

    vc.State.interval = 500;

    vc.State.start = function() {
        if (isStarted) {
            return vc.State;
        }

        var isIeLyingAboutHashChange = 'onhashchange' in window && /MSIE\s(6|7)/.test(navigator.userAgent);

        if ('onpopstate' in window) {
            bind('popstate');
        } else if (!isIeLyingAboutHashChange) {
            bind('hashchange');
        } else {
            bind('hashchange');
            interval = setInterval(function() {
                if (oldState !== window.location.hash) {
                    oldState = window.location.hash;
                    trigger('hashchange');
                }
            }, vc.State.interval);
        }

        isStarted = true;

        return vc.State;
    };

    vc.State.stop = function() {
        if (interval) {
            clearInterval(interval);
        }

        var e = 'onpopstate' in window ? 'popstate' : 'hashchange';
        if (window.removeEventListener) {
            window.removeEventListener(e, dispatch);
        } else if (window[e]) {
            delete window[e];
        }

        isStarted = false;

        return State;
    };



    function removeHostPart(href) {
        return href.replace(/http(s)?\:\/\/[^\/]+/, '');
    }

    function bind(e) {
        if (window.addEventListener) {
            window.addEventListener(e, dispatch, false);
        } else {
            window['on' + e] = dispatch;
        }
    }

    function trigger(e) {
        if (document.createEvent) {
            event = document.createEvent('HTMLEvents');
            event.initEvent(e, true, true);
            window.dispatchEvent(event);
        } else {
            window['on' + e](document.createEventObject());
        }
    }

    function updateHash(uri, scroll) {
        if (scroll) {
            return;
        }

        var id    = uri.replace(/^#/, '');
        var node  = document.getElementById(id);
        var x     = window.pageXOffset ? window.pageXOffset : document.body.scrollLeft;
        var y     = window.pageYOffset ? window.pageYOffset : document.body.scrollTop;
        var dummy = document.createElement('div');

        if (node) {
            node.id = '';
        }

        dummy.id             = id || '_';
        dummy.style.position = 'absolute';
        dummy.style.width    = 0;
        dummy.style.height   = 0;
        dummy.style.left     = x + 'px';
        dummy.style.top      = y + 'px';
        dummy.style.padding  = 0;
        dummy.style.margin   = 0;

        document.body.appendChild(dummy);
        window.location.hash = '#' + dummy.id;
        document.body.removeChild(dummy);

        if (node) {
            node.id = id;
        }
    }

    function dispatch() {
        for (var i = 0; i < bound.length; i++) {
            bound[i].dispatch();
        }
    }
})();
(function() {
    vc.View = vc.Class.extend({
        init: function(options) {
            this.cache = {};

            this.options = vc.utils.merge({
                idPrefix: 'vc-view-',
                idSuffix: '',
                idSeparator: '-',
                target: false,
                http: {
                    prefix: 'views/',
                    suffix: '.html',
                    headers: {
                        Accept: 'text/html'
                    }
                }
            }, options);

            this.http = this.options.http instanceof vc.Http ? this.options.http : new vc.Http(this.options.http);

            return this;
        },

        render: function(name, callback) {
            var $this = this;
            var id    = this.options.idPrefix + name.replace(/\//g, this.options.idSeparator) + this.options.idSuffix;
            var cb    = function() {
                if (typeof callback === 'function') {
                    callback.call(callback, $this, name);
                }
            };

            if (this.cache[name]) {
                this.renderer(this.cache[name]);
                cb();
            } else if (document.getElementById(id)) {
                this.renderer(this.cache[name] = document.getElementById(id).innerHTML);
                cb();
            } else if (this.http) {
                this.http.get({
                    url: name,
                    success: function(html) {
                        $this.renderer($this.cache[name] = html);
                        cb();
                    }
                });
            }

            return this;
        },

        renderer: function(view) {
            var target = this.options.target;

            if (!target) {
                throw 'Cannot render view because no target was specified.';
            }

            if (typeof target === 'string') {
                target = document.getElementById(target);
            } else if (typeof target === 'function') {
                target = target();
            }

            target.innerHTML = view;
        }
    });
})();
(function() {
    // For registering values to.
    vc.values = {};

    // Returns a function that creates a new value accessor for the specified owner.
    vc.value = function(name, options) {
        if (typeof name === 'object') {
            options = name;
            name    = 'default';
        } else if (!name) {
            name = 'default';
        }

        if (typeof vc.values[name] === 'undefined') {
            throw 'The value "' + name + '" is not registered as a Velcro Value.';
        }

        options = vc.utils.merge(vc.values[name].options, options);

        return function(owner) {
            var interval = false;
            var subs     = [];

            var func = function(newValue) {
                if (arguments.length) {
                    func.set(newValue);
                    func.publish();
                    return func.owner;
                }

                return func.get();
            };

            func.options = options;
            func.owner   = owner;
            func.value   = null;

            func.init = function() {
                if (typeof vc.values[name].init === 'function') {
                    vc.values[name].init.call(this);
                }

                this.reset();
            };

            func.get = function() {
                if (typeof vc.values[name].get === 'function') {
                    return vc.values[name].get.call(this);
                }

                return null;
            };

            func.set = function(newValue) {
                if (typeof vc.values[name].set === 'function') {
                    vc.values[name].set.call(this, newValue);
                }

                return this;
            };

            func.reset = function() {
                if (typeof this.options.value !== 'undefined') {
                    this.set(this.options.value);
                } else if (typeof this.value === 'undefined') {
                    this.value = null;
                }

                return this;
            };

            func.subscribe = function(callback) {
                subs.push(callback);
                return this;
            };

            func.unsubscribe = function(callback) {
                for (var i = 0; i < subs.length; i++) {
                    if (callback === subscriber) {
                        subs.splice(index, 1);
                        return;
                    }
                }

                return this;
            };

            func.publish = function() {
                for (var i = 0; i < subs.length; i++) {
                    subs[i]();
                }

                return this;
            };

            func.updateEvery = function(ms) {
                var $this = this;

                interval = setInterval(function() {
                    $this.publish();
                }, ms);

                return this;
            };

            func.stopUpdating = function() {
                if (interval) {
                    clearInterval(interval);
                }

                return this;
            };

            return func;
        };
    };

    vc.value.isWrapped = function(comp) {
        return typeof comp === 'function' && comp.toString() === vc.value().toString();
    };

    vc.value.isUnwrapped = function(comp) {
        return typeof comp === 'function' && comp.toString() === vc.value()().toString();
    };
})();
(function() {
    vc.values.array = {
        init: function() {
            this.options.value = [];
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            if (vc.utils.isArray(value)) {
                this.value = value;
            } else {
                this.value = [value];
            }
        }
    };
})();
(function() {
    vc.values.bool = {
        options: {
            value: false
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = value ? true : false;
        }
    };
})();
(function() {
    vc.values.computed = {
        options: {
            use: [],
            read: false,
            write: false
        },
        init: function() {
            var $this = this;
            var use = this.options.use;

            if (typeof use === 'function') {
                use = use.call(this.owner);
            }

            if (typeof use === 'string') {
                use = [use];
            }

            for (a = 0; a < use.length; a++) {
                if (typeof use[a] === 'string') {
                    use[a] = this.owner[use[a]];
                }
            }

            for (b = 0; b < use.length; b++) {
                use[b].subscribe(function() {
                    $this.publish();
                });
            }
        },
        get: function() {
            if (!this.options.read) {
                throw 'Cannot read value because no read function was defined.'
            }

            return this.options.read.call(this.owner);
        },
        set: function(value) {
            if (!this.options.write) {
                throw 'Cannot write value "' + value + '" because no write function was defined.'
            }

            this.options.write.call(this.owner, value);
        }
    };
})();
(function() {
    vc.values.date = {
        init: function() {
            this.value = new Date();
        },
        get: function() {
            return ths.value;
        },
        set: function(value) {
            this.value = value instanceof Date ? value : new Date(value);
        }
    };
})();
(function() {
    vc.values['default'] = {
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = value;
        }
    };
})();
(function() {
    vc.values['float'] = {
        options: {
            value: 0
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = parseFloat(value);
        }
    };
})();
(function() {
    vc.values['int'] = {
        options: {
            value: 0
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = parseInt(value);
        }
    };
})();
(function() {
    vc.values.many = {
        options: {
            model: vc.Model
        },
        init: function() {
            this.value = new vc.Collection(this.options.model);
            this.value._parent = this.owner;
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value.from(value);
        }
    };
})();
(function() {
    vc.values.one = {
        options: {
            model: vc.Model
        },
        init: function(owner) {
            this.value = new this.options.model();
            this.value._parent = this.owner;
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value.from(value);
        }
    };
})();
(function() {
    vc.values.string = {
        options: {
            value: ''
        },
        get: function() {
            return this.value;
        },
        set: function(value) {
            this.value = '' + value;
        }
    };
})();
(function() {
    vc.Model = vc.Class.extend({
        _observer: vc.value(),

        _parent: null,

        init: function(data) {
            var $this  = this;
            var values = [];

            // For observing overall changes to the model.
            this._observer = this._observer(this);

            // Unwrap all value instances
            for (var a in this) {
                if (vc.value.isWrapped(this[a])) {
                    values.push(this[a] = this[a](this));
                }
            }

            for (var b = 0; b < values.length; b++) {
                values[b].init();
            }

            // So the user doesn't have to worry about calling the parent method and order of operations.
            if (typeof this.setup === 'function') {
                this.setup();
            }

            this.from(data);
        },

        parent: function() {
            return this._parent;
        },

        clone: function() {
            return new this.constructor(this.to());
        },

        each: function(fn) {
            for (var i in this) {
                if (vc.value.isUnwrapped(this[i])) {
                    fn(i, this[i]);
                }
            }

            return this;
        },

        from: function(obj) {
            if (!obj) {
                return this;
            }

            if (obj instanceof vc.Model) {
                obj = obj.to();
            }

            this.each(function(name, value) {
                if (typeof obj[name] !== 'undefined') {
                    value(obj[name]);
                }
            });

            this._observer.publish();

            return this;
        },

        to: function() {
            var out = {};

            this.each(function(name, value) {
                out[name] = value();

                if (out[name] instanceof vc.Model || out[name] instanceof vc.Collection) {
                    out[name] = out[name].to();
                }
            });

            return out;
        },

        reset: function() {
            return this.each(function(i, v) {
                v.reset();
            });
        }
    });

    vc.model = function(def) {
        return vc.Model.extend(def);
    };

    vc.model.make = function(def) {
        return new (this(def))();
    };
})();
(function() {
    vc.Collection = vc.Class.extend({
        _observer: vc.value(),

        _parent: null,

        _model: null,

        init: function(Model, data) {
            Array.prototype.push.apply(this, []);

            this._observer = this._observer(this);
            this._model    = Model;

            this.from(data);
        },

        aggregate: function(joiner, fields) {
            var arr = [];

            if (!fields) {
                fields = [joiner];
                joiner = '';
            }

            this.each(function(k, model) {
                var parts = [];

                vc.utils.each(fields, function(kk, field) {
                    if (typeof model[field] === 'function') {
                        parts.push(model[field]());
                    }
                });

                arr.push(parts.join(joiner));
            });

            return arr;
        },

        at: function(index) {
            return typeof this[index] === 'undefined' ? false : this[index];
        },

        first: function() {
            return this.at(0);
        },

        last: function() {
            return this.at(this.length - 1);
        },

        has: function(index) {
            return typeof this[index] !== 'undefined';
        },

        remove: function(at) {
            at = typeof at === 'number' ? at : this.index(at);

            if (this.has(at)) {
                Array.prototype.splice.call(this, at, 1);
                this._observer.publish();
            }

            return this;
        },

        empty: function() {
            Array.prototype.splice.call(this, 0, this.length);
            this._observer.publish();

            return this;
        },

        prepend: function(item) {
            return this.insert(0, item);
        },

        append: function(item) {
            return this.insert(this.length, item);
        },

        insert: function(at, item) {
            item         = item instanceof vc.Model ? item : new this._model(item);
            item._parent = this._parent;

            Array.prototype.splice.call(this, at, 0, item);
            this._observer.publish();

            return this;
        },

        replace: function (at, item) {
            item         = item instanceof vc.Model ? item : new this._model(item);
            item._parent = this._parent;

            Array.prototype.splice.call(this, at, 1, item);
            this._observer.publish();

            return this;
        },

        index: function(item) {
            var index = -1;

            this.each(function(i, it) {
                if (it === item) {
                    index = i;
                    return;
                }
            });

            return index;
        },

        from: function(data) {
            var $this = this;

            if (data instanceof vc.Collection) {
                data.each(each);
            } else {
                vc.utils.each(data, each);
            }

            function each(i, m) {
                if (!(m instanceof $this._model)) {
                    m = new $this._model(m);
                    m._parent = $this._parent;
                }

                Array.prototype.splice.call($this, i, 1, m);
            }

            this._observer.publish();

            return this;
        },

        to: function() {
            var out = [];

            this.each(function(i, v) {
                out.push(v.to());
            });

            return out;
        },

        each: function(fn) {
            for (var i = 0; i < this.length; i++) {
                fn(i, this[i]);
            }

            return this;
        },

        find: function(query, limit, page) {
            var collection     = new vc.Collection(this._model);
            collection._parent = this._parent;

            if (query instanceof vc.Model) {
                query = query.to();
            }

            if (typeof query === 'object') {
                query = (function(query) {
                    return function() {
                        var that = this,
                            ret  = true;

                        vc.utils.each(query, function(k, v) {
                            if (typeof that[k] === 'undefined' || that[k]() !== v) {
                                ret = false;
                                return false;
                            }
                        });

                        return ret;
                    };
                })(query);
            }

            this.each(function(i, model) {
                if (limit && page) {
                    var offset = (limit * page) - limit;

                    if (offset < i) {
                        return;
                    }
                }

                if (query.call(model, i)) {
                    collection.append(model);
                }

                if (limit && collection.length === limit) {
                    return false;
                }
            });

            return collection;
        },

        findOne: function(query) {
            return this.find(query, 1).first();
        },

        reset: function() {
            return this.each(function(i, v) {
                v.reset();
            });
        }
    });

    vc.collection = function(Model) {
        return vc.Collection.extend({
            init: function(data) {
                vc.Collection.prototype.init.call(this, Model, data);
            }
        });
    };

    vc.collection.make = function(Model) {
        return new (this(Model))();
    };
})();
(function() {
    vc.bindings = {
        vc: {}
    };
})();
(function() {
    vc.bindings.vc.attr = function(app, element) {
        this.update = function(options, bindings) {
            var el = vc.dom(element);

            for (var i in options) {
                el.attr(i, options[i]);
            }
        }
    };
})();
(function() {
    vc.bindings.vc.check = function(app, element) {
        var changing = false;

        this.init = function(options, bindings) {
            var $this = this;

            vc.dom(element).on('change', function() {
                changing = true;

                if (element.checked) {
                    bindings.bind(true);
                } else {
                    bindings.bind(false);
                }

                changing = false;
            });
        };

        this.update = function(options) {
            if (changing) {
                return;
            }

            if (options.bind) {
                element.checked = true;
            } else {
                element.checked = false;
            }
        };
    };
})();
(function() {
    vc.bindings.vc.click = function (app, element) {
        this.update = function(options) {
            vc.dom(element).off('click', options.callback).on('click', options.callback);
        };
    }
})();
(function() {
    vc.bindings.vc.contents = function(app, element) {
        this.update = function(options) {
            if (typeof options.text !== 'undefined') {
                vc.dom(element).text(options.text || '');
            } else if (typeof options.html !== 'undefined') {
                vc.dom(element).contents(options.html || '');
            } else {
                vc.utils.throwForElement(element, 'The "content" binding must be given a "text" or "html" option.');
            }
        };
    };
})();
(function() {
    vc.bindings.vc.css = function(app, element) {
        var element = vc.dom(element);
        var originals = element.css();

        this.update = function(options) {
            element.css(vc.utils.merge(originals, options));
        };
    };
})();
(function() {
    vc.bindings.vc.disable = function(app, element) {
        this.update = function(options) {
            if (options.test) {
                element.disabled = true;
            } else {
                element.disabled = false;
            }
        };
    };
})();
(function() {
    vc.bindings.vc.each = function(app, element) {
        var container = element.parentNode;
        var clones = [];
        var dom = vc.dom(element).attr('data-vc-each', '');
        var reference = document.createComment('each placeholder');
        var template = dom.html();

        element.parentNode.insertBefore(reference, element);
        dom.destroy();

        this.options = {
            as: false
        };

        this.update = function(options) {
            vc.utils.each(clones, function(index, clone) {
                vc.dom(clone).destroy();
            });

            clones = [];

            if (options.items instanceof vc.Model) {
                options.items.each(function(key, value) {
                    each(key, value());
                });
            } else if (options.items instanceof vc.Collection) {
                options.items.each(each);
            } else {
                vc.utils.each(options.items, each);
            }

            function each(key, value) {
                var context = vc.utils.isObject(value) ? value : {};

                context['$index'] = key;
                context['$data']  = value;

                if (options.as) {
                    context[options.as] = value;
                }

                var clone = vc.dom(template).raw();
                app.bind(clone, context);
                clones.push(clone);
                container.insertBefore(clone, reference);

                delete context['$index'];
                delete context['$data'];

                if (options.as) {
                    delete context[options.as];
                }
            }
        };
    };
})();
(function() {
    vc.bindings.vc.enable = function(app, element) {
        this.update = function(options) {
            if (options.test) {
                element.disabled = false;
            } else {
                element.disabled = true;
            }
        };
    };
})();
(function() {
    vc.bindings.vc.extend = function(app, element) {
        var dom = vc.dom(element);
        var html = dom.contents();

        this.options = {
            path: '',
            view: {}
        };

        this.update = function(options) {
            var view = options.view instanceof vc.View ? options.view : new vc.View(options.view);
            var context = app.context();

            context.$content = html;
            view.options.target = element;

            view.render(options.path, function() {
                app.bindDescendants(element, context);
                delete context.$content;
            });
        };
    };
})();
(function() {
    vc.bindings.vc.focus = function(app, element) {
        var changing = false;
        var dom = vc.dom(element);

        this.init = function(options, bindings) {
            dom.on('focus', function() {
                changing = true;
                bindings.bind(true);
                changing = false;
            }).on('blur', function() {
                changing = true;
                bindings.bind(false);
                changing = false;
            });
        };

        this.update = function(options, bindings) {
            if (changing) {
                return;
            }

            if (options.bind) {
                element.focus();
                dom.fire('focus');
            } else {
                element.blur();
                dom.fire('blur');
            }
        };
    };
})();
(function() {
    vc.bindings.vc.hide = function(app, element) {
        this.update = function(options) {
            if (options.test) {
                element.style.display = 'none';
            } else {
                element.style.display = null;
            }
        };
    };
})();
(function() {
    vc.bindings.vc['if'] = function(app, element) {
        var display = 'none';

        this.init = function(options) {
            this.display = element.style.display;

            if (!options.test) {
                element.style.display = 'none';
            }
        };

        this.update = function(options) {
            if (options.test) {
                element.style.display = this.display;
            } else if (element.parentNode) {
                element.style.display = 'none';
            }
        };
    };
})();
(function() {
    vc.bindings.vc.ifnot = function(app, element) {
        var display = 'block';

        this.init = function(options) {
            this.display = element.style.display;

            if (options.test) {
                element.style.display = 'none';
            }
        };

        this.update = function(options) {
            if (options.test) {
                element.style.display = 'none';
            } else if (element.parentNode) {
                element.style.display = this.display;
            }
        };
    };
})();
(function() {
    vc.bindings.vc.include = function(app, element) {
        this.options = {
            path: '',
            context: false,
            callback: function(){},
            view: {}
        };

        this.update = function(options) {
            var view = options.view instanceof vc.View ? options.view : new vc.View(options.view);

            // ensure the target is fixed to the element
            view.options.target = element;

            if (typeof options.context === 'function') {
                options.context = options.context();
            }

            if (!options.path) {
                vc.utils.throwForElement(element, 'A path option must be specified.');
            }

            view.render(options.path, function() {
                app.bindDescendants(element, options.context);

                if (typeof options.callback === 'function') {
                    options.callback();
                }
            });
        };
    };
})();
(function() {
    vc.bindings.vc.on = function(app, element) {
        var dom = vc.dom(element);

        this.update = function(options) {
            vc.utils.each(options, function(name, callback) {
                dom.off(name, callback).on(name, callback);
            });
        };
    };
})();
(function() {
    vc.bindings.vc.options = function(app, element) {
        var dom = vc.dom(element);

        this.options = {
            options: [],
            caption: '',
            text: '',
            value: ''
        };

        this.update = function(options) {
            if (dom.tag() !== 'select') {
                vc.utils.throwForElement(element, 'The options binding can only be bound to select list.');
            }

            if (typeof options.caption !== 'undefined') {
                dom.contents('<option value="">' + extract(options.caption) + '</option>');
            }

            if (typeof options.options instanceof vc.Collection) {
                options.options.each(each);
            } else {
                vc.utils.each(options.options, each);
            }

            function each(index, item) {
                dom.append('<option value="' + extractFrom(item, options.value) + '">' + extractFrom(item, options.text) + '</option>');
            };
        };
    };

    function extract(item) {
        if (!item) {
            return '';
        }

        if (typeof item === 'function') {
            return item();
        }

        return item;
    }

    function extractFrom(item, using) {
        if (!using) {
            return '';
        }

        if (typeof using === 'function') {
            return using(item);
        }

        if (item instanceof vc.Model) {
            return item[using]();
        }

        return item;
    }
})();
(function() {
    vc.bindings.vc.routable = function(app, element) {
        this.update = function(options) {
            var router = options.router;

            if (!router) {
                vc.utils.throwForElement(element, 'Cannot bind router because it cannot be found.');
            }

            if (!router instanceof vc.Router) {
                vc.utils.throwForElement(element, 'Cannot bind router because it is not an instanceof "vc.Router".');
            }

            router.view.options.target = element;
            router.bind();
        };
    };
})();
(function() {
    vc.bindings.vc.show = function(app, element) {
        this.update = function(options) {
            if (options.test) {
                element.style.display = null;
            } else {
                element.style.display = 'none';
            }
        };
    };
})();
(function() {
    vc.bindings.vc.style = function(app, element) {
        this.update = function(options) {
            for (var i in options) {
                element.style[i] = typeof options[i] === 'function' ? options[i]() : options[i];
            }
        };
    };
})();
(function() {
    vc.bindings.vc.submit = function(app, element) {
        var dom = vc.dom(element);

        this.init = function(options, bindings) {
            dom.on('submit', function(e) {
                if (options.callback() !== true) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        };
    };
})();
(function() {
    vc.bindings.vc.value = function(app, element) {
        var dom = vc.dom(element);

        this.options = {
            on: 'change'
        };

        this.update = function(options, bindings) {
            dom.off(options.on, update).on(options.on, update);

            element.value = options.value;

            function update() {
                bindings.value(element.value);
            }
        };
    };
})();
(function() {
    vc.bindings.vc['with'] = function(app, element) {
        this.update = function(options) {
            var context;

            if (typeof options.model === 'object') {
                context = options.model;
            } else if (typeof options.controller === 'function') {
                context = options.controller();
            } else {
                vc.utils.throwForElement(element, 'You must either specify a model or controller to the "with" context.');
            }

            app.bindDescendants(element, context);
        };
    };
})();
(function() {
    var _bound = [];

    vc.App = vc.Class.extend({
        init: function() {
            this.contexts = [];
        },

        bind: function(element, context) {
            if (context) {
                this.context(context);
            }

            this.bindOne(element);
            this.bindDescendants(element);

            if (context) {
                this.contexts.pop();
            }

            return this;
        },

        bindDescendants: function(parent, context) {
            var $this = this;

            vc.utils.each(parent.childNodes, function(index, element) {
                $this.bind(element, context);
            });

            return this;
        },

        bindOne: function(element) {
            var $this = this;

            element = vc.dom(element).raw();

            // Do not bind the same element more than once.
            if (_bound.indexOf(element) === -1) {
                _bound.push(element);
            } else {
                return this;
            }

            vc.utils.each(element.attributes, function(i, node) {
                // An element may have been altered inside of a binding, therefore
                // we must check if the binding still exists.
                if (typeof element.attributes[i] === 'undefined') {
                    return;
                }

                // Bindings must be data- attributes.
                if (node.nodeName.indexOf('data-') === -1) {
                    return;
                }

                // A namespace is in the format of "data-[namespace]-[bindingName]".
                var binding = node.nodeName.match(/^data-([^\-]+)-(.+)/);

                // If there isn't a namespaced binding continue.
                if (!binding) {
                    return;
                }

                // Binding namespace and binding must be registered.
                if (typeof vc.bindings[binding[1]] === 'undefined' || typeof vc.bindings[binding[1]][binding[2]] === 'undefined') {
                    return;
                }

                $this.bindAttribute(element, binding[1], binding[2], node.nodeValue);
            });

            return this;
        },

        bindAttribute: function (element, namespace, binding, value) {
            // The context is saved so that if it changes it won't mess up a subscriber.
            var context = this.context();

            // Contains parsed information for the initial updates.
            var parsed = parse();

            // This will initialise the binding and do any initial changes to the bound elements.
            // Subscribable values are also extracted and passed in so that accessing them is trivial.
            var inst = vc.bindings[namespace][binding];

            // Binding must be newable.
            if (typeof inst === 'function') {
                inst = new inst(this, element);
            } else {
                throw 'The binding "' + binding + '" must be a function.';
            }

            // Initialisation.
            if (typeof inst.init === 'function') {
                inst.init(vc.utils.merge(inst.options, parsed.options), parsed.bound);
            } else if (typeof inst.update === 'function') {
                inst.update(vc.utils.merge(inst.options, parsed.options), parsed.bound);
            }

            // If an update method is provided, subscribe to updates with it.
            if (typeof inst.update === 'function') {
                for (var i in parsed.bound) {
                    parsed.bound[i].subscribe(subscriber);
                }
            }

            return this;

            // Returns an object that conains raw, extracted values from the passed in bindings as well as bindable members.
            // Bindable members included any vc.value, vc.Model and vc.Collection.
            function parse() {
                var temp = vc.utils.parseBinding(value, context);
                var comp = { options: {}, bound: {} };

                for (var i in temp) {
                    if (vc.value.isUnwrapped(temp[i])) {
                        comp.options[i] = temp[i]();

                        if (comp.options[i] instanceof vc.Model || comp.options[i] instanceof vc.Collection) {
                            comp.bound[i] = comp.options[i]._observer;
                        } else {
                            comp.bound[i] = temp[i];
                        }
                    } else if (typeof temp[i] === 'function') {
                        comp.options[i] = temp[i].bind(context);
                    } else {
                        comp.options[i] = temp[i];
                    }
                }

                return comp;
            }

            // Triggers updates within the binding when a observer changes.
            function subscriber() {
                var refreshed = parse();
                inst.update(vc.utils.merge(inst.options, refreshed.options), refreshed.bound);
            }
        },

        context: function(context) {
            // Getting.
            if (arguments.length === 0) {
                if (!this.contexts.length) {
                    this.context({});
                }

                return this.contexts[this.contexts.length - 1];
            }

            // We must emulate a context hierarchy.
            if (this.contexts.length) {
                context.$parent = this.contexts[this.contexts.length - 1];
                context.$root   = this.contexts[0];
            } else {
                context.$parent = false;
                context.$root   = false;
            }

            // The youngest descendant in the context hierarchy is the last one in the list.
            this.contexts.push(context);

            return this;
        }
    });

    vc.app = function(element, context) {
        var app = new vc.App();

        if (typeof context === 'undefined') {
            context = element;
            element = document;
        }

        onready(function() {
            app.bind(element, context);
        });

        return app;
    };

    // Thanks Diego Perini!
    function onready(fn) {
        var done = false;
        var top = true;
        var win = window;
        var doc = win.document;
        var root = doc.documentElement;
        var add = doc.addEventListener ? 'addEventListener' : 'attachEvent';
        var rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent';
        var pre = doc.addEventListener ? '' : 'on';

        init = function(e) {
            if (e.type === 'readystatechange' && doc.readyState !== 'complete') {
                return;
            }

            (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);

            if (!done && (done = true)) {
                fn.call(win, e.type || e);
            }
        },

        poll = function() {
            try {
                root.doScroll('left');
            } catch(e) {
                setTimeout(poll, 50); return;
            }

            init('poll');
        };

        if (doc.readyState == 'complete') {
            fn.call(win, 'lazy');
        } else {
            if (doc.createEventObject && root.doScroll) {
                try {
                    top = !win.frameElement;
                } catch(e) {

                }

                if (top) {
                    poll();
                }
            }

            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    }
})();
});