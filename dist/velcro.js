!function(factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        factory(module.exports || exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory(window.velcro = {});
    }
}(function(velcro) {
    (function() {
    velcro.utils = {
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

        isClass: function(obj) {
            return typeof obj === 'function' && typeof obj.extend === 'function' && obj.extend === velcro.Class.extend;
        },

        isInstance: function(obj) {
            return obj && typeof obj.constructor === 'function';
        },

        isObject: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Object]';
        },

        isValue: function(value) {
            return typeof value === 'function' && value.toString() === velcro.value().toString();
        },

        merge: function() {
            var merged = {};

            for (var i = 0; i < arguments.length; i++) {
                var param = arguments[i];

                if (!velcro.utils.isObject(param)) {
                    continue;
                }

                for (var ii in param) {
                    var value = param[ii];

                    if (typeof merged[ii] === 'undefined') {
                        merged[ii] = value;
                        continue;
                    }

                    if (velcro.utils.isInstance(value)) {
                        merged[ii] = value;
                        continue;
                    }

                    if (velcro.utils.isObject(merged[ii]) && velcro.utils.isObject(value)) {
                        merged[ii] = velcro.utils.merge(merged[ii], value);
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

            velcro.utils.each(obj, function(name, value) {
                if (velcro.utils.isValue(value)) {
                    options[name] = value();
                } else {
                    options[name] = value;
                }
            });

            return options;
        },

        throwForElement: function(element, message) {
            throw message + "\n" + velcro.dom(element).html();
        }
    };
})();
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
(function() {
    var dom = velcro.Class.extend({
        element: null,

        init: function(element) {
            this.element = typeof element === 'string' ? fromHtml(element) : element;
        },

        raw: function() {
            return this.element;
        },

        css: function(classes) {
            var css = [];

            for (var name in classes) {
                if (classes[name]) {
                    if (css.indexOf(name) === -1) {
                        css.push(classes[name]);
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
            this.element.appendChild(velcro.dom(child).raw());
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

    velcro.dom = function(element) {
        return new dom(element);
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
    velcro.Binding = velcro.Class.extend({
        options: {},

        init: function(app, element, options, bound) {
            options = velcro.utils.merge(this.options, options);

            if (typeof this.setup === 'function') {
                this.setup(app, element, options, bound);
            } else if (typeof this.update === 'function') {
                this.update(app, element, options, bound);
            }
        }
    });

    velcro.binding = function(def) {
        return velcro.Binding.extend(def);
    };
})();
(function() {
    velcro.Event = velcro.Class.extend({
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
    velcro.Http = velcro.Class.extend({
        init: function(options) {
            this.before  = new velcro.Event();
            this.after   = new velcro.Event();
            this.success = new velcro.Event();
            this.error   = new velcro.Event();
            this.options = velcro.utils.merge({
                async: true,
                cache: false,
                headers: {},
                parsers: { 'application/json': velcro.utils.parseJson },
                prefix: '',
                suffix: ''
            }, options);

            return this;
        },

        'delete': function(options) {
            return this.request(velcro.utils.merge(options, {
                type: 'delete'
            }));
        },

        get: function(options) {
            return this.request(velcro.utils.merge(options, {
                type: 'get'
            }));
        },

        head: function(options) {
            return this.request(velcro.utils.merge(options, {
                type: 'head'
            }));
        },

        options: function(options) {
            return this.request(velcro.utils.merge(options, {
                type: 'options'
            }));
        },

        patch: function(options) {
            return this.request(velcro.utils.merge(options, {
                type: 'patch'
            }));
        },

        post: function(options) {
            return this.request(velcro.utils.merge(options, {
                type: 'post'
            }));
        },

        put: function(options) {
            return this.request(velcro.utils.merge(options, {
                type: 'put'
            }));
        },

        request: function(options) {
            var $this   = this;
            var request = createXmlHttpRequest();

            options = velcro.utils.merge({
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

            if (data instanceof velcro.Model) {
                data = data.raw();
            }

            if (velcro.utils.isObject(data)) {
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

    velcro.Router = velcro.Class.extend({
        init: function(options) {
            this.options = velcro.utils.merge({
                app: {},
                state: {},
                view: {}
            }, options);

            this.enter  = new velcro.Event();
            this.exit   = new velcro.Event();
            this.render = new velcro.Event();

            this.params = {};
            this.route  = false;
            this.routes = {};

            this.app   = this.options.app   instanceof velcro.App   ? this.options.app   : new velcro.App(this.options.app);
            this.state = this.options.state instanceof velcro.State ? this.options.state : new velcro.State(this.options.state);
            this.view  = this.options.view  instanceof velcro.View  ? this.options.view  : new velcro.View(this.options.view);

            return this;
        },

        handler: function(execute) {
            execute();
        },

        renderer: function(route, params) {
            var $this   = this;
            var context = route.options.controller.apply(route.options.controller, params);

            if (context instanceof velcro.Model) {
            } else {
                context = velcro.Model.extend(context);
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
            if (!(route instanceof velcro.Route)) {
                route = new velcro.Route(velcro.utils.merge({
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



    velcro.Route = velcro.Class.extend({
        init: function(options) {
            this.options = velcro.utils.merge({
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

    velcro.State = velcro.Class.extend({
        previous: false,

        enabled: false,

        init: function(options) {
            this.options = velcro.utils.merge({
                scroll: false
            });

            this.states = {};

            velcro.State.start();

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

    velcro.State.interval = 500;

    velcro.State.start = function() {
        if (isStarted) {
            return velcro.State;
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
            }, velcro.State.interval);
        }

        isStarted = true;

        return velcro.State;
    };

    velcro.State.stop = function() {
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
    velcro.View = velcro.Class.extend({
        init: function(options) {
            this.cache = {};

            this.options = velcro.utils.merge({
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

            this.http = this.options.http instanceof velcro.Http ? this.options.http : new velcro.Http(this.options.http);

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
    velcro.value = function(options) {
        var interval;
        var subs  = [];
        var value = null;

        if (!velcro.utils.isObject(options)) {
            options = { defaultValue: options };
        }

        options = velcro.utils.merge({
            defaultValue: null,
            bind: func,
            get: function() {
                return value;
            },
            set: function(newValue) {
                value = newValue;
            }
        }, options);

        value = options.defaultValue;

        function func(newValue) {
            if (arguments.length === 0) {
                return options.get.call(options.bind);
            } else {
                options.set.call(options.bind, newValue);
                func.publish();
                return options.bind;
            }
        }

        func.subscribe = function(callback) {
            subs.push(callback);
            return options.bind;
        };

        func.unsubscribe = function(callback) {
            for (var i = 0; i < subs.length; i++) {
                if (callback === subscriber) {
                    subs.splice(index, 1);
                    return;
                }
            }

            return options.bind;
        };

        func.publish = function() {
            var newValue = func();

            for (var i = 0; i < subs.length; i++) {
                subs[i](newValue);
            }

            return options.bind;
        };

        func.updateEvery = function(ms) {
            interval = setInterval(function() {
                func.publish();
            }, ms);
        };

        func.stopUpdating = function() {
            if (interval) {
                clearInterval(interval);
            }
        };

        return func;
    };
})();
(function() {
    velcro.Model = velcro.Class.extend({
        _observer: null,

        _parent: null,

        init: function(data) {
            defineIfNotDefined(this);
            applyDefinition(this);

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
            var def = this.constructor.definition;

            for (var a in def.relations) {
                fn(a, this[a]);
            }

            for (var b in def.properties) {
                fn(b, this[b]);
            }

            for (var c in def.computed) {
                fn(c, this[c]);
            }

            return this;
        },

        from: function(obj) {
            if (!obj) {
                return this;
            }

            if (obj instanceof velcro.Model) {
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

                if (out[name] instanceof velcro.Model || out[name] instanceof velcro.Collection) {
                    out[name] = out[name].to();
                }
            });

            return out;
        }
    });

    velcro.model = function(def) {
        return velcro.Model.extend(def);
    };

    function defineIfNotDefined(obj) {
        if (!obj.constructor.definition) {
            define(obj);
        }
    }

    function define(obj) {
        initDefinition(obj);
        definePrototype(obj);
    }

    function initDefinition(obj) {
        obj.constructor.definition = {
            relations: {},
            properties: {},
            computed: {},
            methods: {}
        };
    }

    function definePrototype(obj) {
        for (var i in obj) {
            if (typeof velcro.Model.prototype[i] !== 'undefined') {
                continue;
            }

            var v = obj[i];

            if (velcro.utils.isClass(v) && (v.isSubClassOf(velcro.Model) || v.isSubClassOf(velcro.Collection))) {
                obj.constructor.definition.relations[i] = v;
                continue;
            }

            if (typeof v === 'function') {
                var name = false;
                var type = false;

                if (i.indexOf('get') === 0) {
                    name = i.substring(3, 4).toLowerCase() + i.substring(4);
                    type = 'get';
                } else if (i.indexOf('set') === 0) {
                    name = i.substring(3, 4).toLowerCase() + i.substring(4);
                    type = 'set';
                }

                if (type) {
                    if (typeof obj.constructor.definition.computed[name] === 'undefined') {
                        obj.constructor.definition.computed[name] = {};
                    }

                    obj.constructor.definition.computed[name][type] = v;
                } else {
                    obj.constructor.definition.methods[i] = v;
                }

                continue;
            }

            obj.constructor.definition.properties[i] = v;
        }
    }

    function applyDefinition(obj) {
        applyObserver(obj);
        applyRelations(obj);
        applyProperties(obj);
        applyComputed(obj);
        applyMethods(obj);
    }

    function applyObserver(obj) {
        obj._observer = velcro.value({
            bind: obj,
            get: function() {
                return this;
            },
            set: function(value) {
                this.from(value);
            }
        });
    }

    function applyRelations(obj) {
        for (var i in obj.constructor.definition.relations) {
            var instance = new obj.constructor.definition.relations[i]();
            instance._parent = obj;
            obj[i] = instance._observer;
        }
    }

    function applyProperties(obj) {
        for (var i in obj.constructor.definition.properties) {
            obj[i] = velcro.value({
                bind: obj,
                defaultValue: obj.constructor.definition.properties[i]
            });
        }
    }

    function applyComputed(obj) {
        for (var i in obj.constructor.definition.computed) {
            var options = {
                bind: obj
            };

            if (typeof obj.constructor.definition.computed[i].get === 'function') {
                options.get = obj.constructor.definition.computed[i].get;
            }

            if (typeof obj.constructor.definition.computed[i].set === 'function') {
                options.set = obj.constructor.definition.computed[i].set;
            }

            obj[i] = velcro.value(options);
        }
    }

    function applyMethods(obj) {
        for (var i in obj.constructor.definition.methods) {
            obj[i] = (function(method) {
                return function() {
                    return method.apply(obj, Array.prototype.slice.call(arguments));
                };
            })(obj.constructor.definition.methods[i]);
        }
    }

    function generateGetterSetterThrower(type, name) {
        return function() {
            throw 'No ' + type + ' defined for computed property "' + name + '".';
        };
    }
})();
(function() {
    velcro.Collection = velcro.Class.extend({
        _observer: null,

        _parent: null,

        _model: null,

        init: function(Model, data) {
            Array.prototype.push.apply(this, []);

            this._observer = velcro.value({
                bind: this,
                get: function() {
                    return this;
                },
                set: function(value) {
                    this.from(value);
                }
            });

            this._model = Model;

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

                velcro.utils.each(fields, function(kk, field) {
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
            item         = item instanceof velcro.Model ? item : new this._model(item);
            item._parent = this._parent;

            Array.prototype.splice.call(this, at, 0, item);
            this._observer.publish();

            return this;
        },

        replace: function (at, item) {
            item         = item instanceof velcro.Model ? item : new this._model(item);
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
            var that = this;

            if (data instanceof velcro.Collection) {
                data = data.to();
            }

            velcro.utils.each(data, function(i, model) {
                if (that.has(i)) {
                    that.replace(i, model);
                } else {
                    that.replace(i, model);
                }
            });

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
            var collection     = new velcro.Collection(this._model);
            collection._parent = this._parent;

            if (query instanceof velcro.Model) {
                query = query.to();
            }

            if (typeof query === 'object') {
                query = (function(query) {
                    return function() {
                        var that = this,
                            ret  = true;

                        velcro.utils.each(query, function(k, v) {
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
        }
    });

    velcro.collection = function(Model) {
        return velcro.Collection.extend({
            init: function(data) {
                this.$super(Model, data);
            }
        });
    };
})();
(function() {
    velcro.bindings = {};
})();
(function() {
    velcro.bindings.attr = velcro.binding({
        update: function(app, element, options) {
            var el = velcro.dom(element);

            for (var i in options) {
                el.attr(i, options[i]);
            }
        }
    });
})();
(function() {
    velcro.bindings.check = velcro.binding({
        changing: false,

        setup: function(app, element, options, bindings) {
            var $this = this;

            velcro.dom(element).on('change', function() {
                $this.changing = true;

                if (element.checked) {
                    bindings.bind(true);
                } else {
                    bindings.bind(false);
                }

                $this.changing = false;
            });
        },

        update: function(app, element, options) {
            if (this.changing) {
                return;
            }

            if (options.bind) {
                element.checked = true;
            } else {
                element.checked = false;
            }
        }
    });
})();
(function() {
    velcro.bindings.click = velcro.binding({
        update: function(app, element, options) {
            velcro.dom(element).off('click', options.callback).on('click', options.callback);
        }
    })
})();
(function() {
    velcro.bindings.contents = velcro.binding({
        update: function(app, element, options) {
            if (typeof options.text !== 'undefined') {
                velcro.dom(element).text(options.text || '');
            } else if (typeof options.html !== 'undefined') {
                velcro.dom(element).contents(options.html || '');
            } else {
                velcro.utils.throwForElement(element, 'The "content" binding must be given a "text" or "html" option.');
            }
        }
    });
})();
(function() {
    velcro.bindings.css = velcro.binding({
        update: function(app, element, options) {
            velcro.dom(element).css(options);
        }
    });
})();
(function() {
    velcro.bindings.disable = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.disabled = true;
            } else {
                element.disabled = false;
            }
        }
    });
})();
(function() {
    velcro.bindings.each = velcro.binding({
        app: null,

        clones: null,

        container: null,

        options: {
            key: '$key',
            value: '$value'
        },

        reference: null,

        template: null,

        setup: function(app, element, options) {
            var dom = velcro.dom(element);
            dom.attr(app.options.attributePrefix + 'each', '');

            this.app       = app;
            this.clones    = [];
            this.container = element.parentNode;
            this.template  = dom.html();
            this.reference = document.createComment('each placeholder');

            element.parentNode.insertBefore(this.reference, element);
            dom.destroy();
            this.update(app, element, options);
        },

        update: function(app, element, options) {
            var $this = this;

            velcro.utils.each(this.clones, function(index, clone) {
                velcro.dom(clone).destroy();
            });

            this.clones = [];

            if (options.items instanceof velcro.Model) {
                options.items.each(function(key, value) {
                    each(key, value());
                });
            } else if (options.items instanceof velcro.Collection) {
                options.items.each(each);
            } else {
                velcro.utils.each(options.items, each);
            }

            function each(key, value) {
                var context = velcro.utils.isObject(value) ? value : {};

                context[$this.options.key]   = key;
                context[$this.options.value] = value;

                var clone = velcro.dom($this.template).raw();
                app.bind(clone, context);
                $this.clones.push(clone);
                $this.container.insertBefore(clone, $this.reference);

                delete context[$this.options.key];
                delete context[$this.options.value];
            }
        },

        clean: function(app, element) {
            element.removeAttribute(app.options.attributePrefix + 'each');
            return element;
        }
    });
})();
(function() {
    velcro.bindings.enable = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.disabled = false;
            } else {
                element.disabled = true;
            }
        }
    });
})();
(function() {
    velcro.bindings.extend = velcro.binding({
        options: {
            path: '',
            view: {}
        },

        html: '',

        setup: function(app, element, options) {
            this.html = velcro.dom(element).contents();
            this.update(app, element, options);
        },

        update: function(app, element, options) {
            var view    = options.view instanceof velcro.View ? options.view : new velcro.View(options.view);
            var $this   = this;
            var context = app.context();

            context.$content    = this.html;
            view.options.target = element;

            view.render(options.path, function() {
                app.bindDescendants(element, context);
            });
        }
    });
})();
(function() {
    velcro.bindings.focus = velcro.binding({
        changing: false,

        setup: function(app, element, options, bindings) {
            var $this = this;

            velcro.dom(element)
                .on('focus', function() {
                    $this.changing = true;
                    bindings.bind(true);
                    $this.changing = false;
                })
                .on('blur', function() {
                    $this.changing = true;
                    bindings.bind(false);
                    $this.changing = false;
                });
        },

        update: function(app, element, options, bindings) {
            if (this.changing) {
                return;
            }

            if (options.bind) {
                element.focus();
                velcro.dom(element).fire('focus');
            } else {
                element.blur();
                velcro.dom(element).fire('blur');
            }
        }
    });
})();
(function() {
    velcro.bindings.hide = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.style.display = 'none';
            } else {
                element.style.display = null;
            }
        }
    });
})();
(function() {
    velcro.bindings['if'] = velcro.binding({
        display: 'none',

        setup: function(app, element, options) {
            this.display = element.style.display;

            if (!options.test) {
                element.style.display = 'none';
            }
        },

        update: function(app, element, options) {
            if (options.test) {
                element.style.display = this.display;
            } else if (element.parentNode) {
                element.style.display = 'none';
            }
        }
    });
})();
(function() {
    velcro.bindings.include = velcro.binding({
        options: {
            path: '',
            context: false,
            callback: function(){},
            view: {}
        },

        update: function(app, element, options) {
            var view = options.view instanceof velcro.View ? options.view : new velcro.View(options.view);

            // ensure the target is fixed to the element
            view.options.target = element;

            if (typeof options.context === 'function') {
                options.context = options.context();
            }

            if (!options.path) {
                velcro.utils.throwForElement(element, 'A path option must be specified.');
            }

            view.render(options.path, function() {
                app.bindDescendants(element, options.context);

                if (typeof options.callback === 'function') {
                    options.callback();
                }
            });
        }
    });
})();
(function() {
    velcro.bindings.on = velcro.binding({
        update: function(app, element, options) {
            var dom = velcro.dom(element);

            velcro.utils.each(options, function(name, callback) {
                dom.off(name, callback).on(name, callback);
            });
        }
    });
})();
(function() {
    velcro.bindings.options = velcro.binding({
        options: {
            options: [],
            caption: '',
            text: '',
            value: ''
        },

        update: function(app, element, options) {
            this.check(element);

            if (typeof options.caption !== 'undefined') {
                velcro.dom(element).contents('<option value="">' + extract(options.caption) + '</option>');
            }

            if (typeof options.options instanceof velcro.Collection) {
                options.options.each(each);
            } else {
                velcro.utils.each(options.options, each);
            }

            function each(index, item) {
                velcro.dom(element).append('<option value="' + extractFrom(item, options.value) + '">' + extractFrom(item, options.text) + '</option>');
            };
        },

        check: function(element) {
            if (velcro.dom(element).tag() !== 'select') {
                velcro.utils.throwForElement(element, 'The options binding can only be bound to select list.');
            }
        }
    });

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

        if (item instanceof velcro.Model) {
            return item[using]();
        }

        return item;
    }
})();
(function() {
    velcro.bindings.routable = velcro.binding({
        update: function(app, element, options) {
            var router = options.router;

            if (!router) {
                velcro.utils.throwForElement(element, 'Cannot bind router because it cannot be found.');
            }

            if (!router instanceof velcro.Router) {
                velcro.utils.throwForElement(element, 'Cannot bind router because it is not an instanceof "velcro.Router".');
            }

            router.view.options.target = element;
            router.bind();
        }
    });
})();
(function() {
    velcro.bindings.show = velcro.binding({
        update: function(app, element, options) {
            if (options.test) {
                element.style.display = null;
            } else {
                element.style.display = 'none';
            }
        }
    });
})();
(function() {
    velcro.bindings.submit = velcro.binding({
        setup: function(app, element, options, bindings) {
            velcro.dom(element).on('submit', function(e) {
                if (options.callback() !== true) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    });
})();
(function() {
    velcro.bindings.value = velcro.binding({
        options: {
            on: 'change'
        },

        update: function(app, element, options, bindings) {
            velcro.dom(element).off(options.on, update).on(options.on, update);

            element.value = options.value;

            function update() {
                bindings.value(element.value);
            }
        }
    });
})();
(function() {
    velcro.bindings['with'] = velcro.binding({
        update: function(app, element, options) {
            if (!options.context) {
                velcro.utils.throwForElement(element, 'A context option must be specified.');
            }

            app.context(options.context);
        }
    });
})();
(function() {
    var _bound = [];

    velcro.App = velcro.Class.extend({
        init: function(options) {
            this.options = velcro.utils.merge({
                attributePrefix: 'data-vc-',
                bindings: velcro.bindings
            }, options);

            this.contexts = [];
        },

        bind: function(element, context) {
            if (arguments.length === 1) {
                context = element;
                element = document;
            }

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

            velcro.utils.each(parent.childNodes, function(index, element) {
                $this.bind(element, context);
            });

            return this;
        },

        bindOne: function(element) {
            var $this = this;

            // Do not bind the same element more than once.
            if (_bound.indexOf(element) === -1) {
                _bound.push(element);
            } else {
                return this;
            }

            velcro.utils.each(element.attributes, function(i, node) {
                // An element may have been altered inside of a binding, therefore
                // we must check if the binding still exists.
                if (typeof element.attributes[i] === 'undefined') {
                    return;
                }

                var name = node.nodeName.substring($this.options.attributePrefix.length);

                if (typeof $this.options.bindings[name] === 'function') {
                    $this.bindAttribute(element, name, node.nodeValue);
                }
            });

            return this;
        },

        bindAttribute: function (element, name, value) {
            var $this = this;

            // The context is saved so that if it changes it won't mess up a subscriber.
            var context = this.context();

            // Contains parsed information for the initial updates.
            var parsed = parse();

            // This will initialise the binding and do any initial changes to the bound elements.
            // Subscribable values are also extracted and passed in so that accessing them is trivial.
            var binding = new this.options.bindings[name](this, element, parsed.options, parsed.bound);

            if (typeof binding.update === 'function') {
                for (var i in parsed.bound) {
                    parsed.bound[i].subscribe(subscriber);
                }
            }

            return this;

            // Returns an object that conains raw, extracted values from the passed in bindings as well as bindable members.
            // Bindable members included any velcro.value, velcro.Model and velcro.Collection.
            function parse() {
                var temp = velcro.utils.parseBinding(value, context);
                var comp = { options: {}, bound: {} };

                for (var i in temp) {
                    if (velcro.utils.isValue(temp[i])) {
                        comp.options[i] = temp[i]();
                        comp.bound[i]   = temp[i];
                    } else if (temp[i] instanceof velcro.Model || temp[i] instanceof velcro.Collection) {
                        comp.options[i] = temp[i]._observer();
                        comp.bound[i]   = temp[i]._observer;
                    } else {
                        comp.options[i] = temp[i];
                    }
                }

                return comp;
            }

            function subscriber() {
                var refreshed = parse();
                binding.update($this, element, refreshed.options, refreshed.bound);
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
})();
});