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
        addEvent: function(element, event, callback) {
            if (element.addEventListener) {
                element.addEventListener(event, proxy, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + event, function(e) {
                    proxy.call(element, e);
                });
            } else {
                element['on' + event] = proxy;
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
        },

        createElement: function(html) {
            var tag = html.match(/^<([^\s>]+)/)[1];
            var div = document.createElement(detectParentTagName(tag));
            div.innerHTML = html;
            var element = div.childNodes[0];
            div.removeChild(element);
            return element;
        },

        destroyElement: function(element) {
            element.parentNode.removeChild(element);
            element.innerHTML = '';
            delete element.attributes;
            delete element.childNodes;
        },

        elementIndex: function(element) {
            for (var i = 0; i < element.parentNode.childNodes; i++) {
                if (element === element.parentNode.childNodes[i]) {
                    return i;
                }
            }

            return false;
        },

        html: function(element) {
            var div = document.createElement(detectParentTagName(element.tagName));
            div.appendChild(element.cloneNode(true));
            return div.innerHTML;
        },

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

                    if (velcro.utils.isObject(value)) {
                        if (typeof merged[ii] === 'undefined' || velcro.utils.isInstance(value)) {
                            merged[ii] = value;
                        } else {
                            merged[ii] = velcro.utils.merge(merged[ii], value);
                        }
                    } else {
                        merged[ii] = value;
                    }
                }
            }

            return merged;
        },

        parseBinding: function(json, context) {
            var code = '';

            for (var i in context || {}) {
                if (i === 'import' || i === 'export' || i === '') {
                    continue;
                }

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
            throw message + "\n" + velcro.html(element);
        }
    };

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
    velcro.Class = function() {};

    var extending  = false;
    var classes    = [];
    var extensions = {};

    velcro.Class.extend = function(definition) {
        var Child = createChild();
        register(this, Child);
        applyPrototype(this, Child);
        applyDefinition(this, Child, arguments.callee, definition);
        return Child;
    };

    function createChild() {
        return function() {
            if (!extending && typeof this.init === 'function') {
                this.init.apply(this, arguments);
            }
        };
    }

    function applyPrototype(Parent, Child) {
        extending = true;
        Child.prototype = new Parent();
        extending = false;
    }

    function applyDefinition(Parent, Child, extend, definition) {
        Child.extend = extend;

        Child.isSubClassOf = function(Ancestor) {
            var Parent = extensions[classes.indexOf(Child)];
            return Parent === velcro.Class || Parent === Ancestor || Parent.isSubClassOf(Ancestor);
        };

        for (var i in definition) {
            if (typeof Child.prototype[i] === 'function') {
                Child.prototype[i] = createProxy(Parent.prototype, definition, i);
            } else {
                Child.prototype[i] = definition[i];
            }
        }

        Child.prototype.constructor = Child;
    }

    function createProxy(prototype, definition, name) {
        return (function(name, fn) {
            return function() {
                var tmp = this.$super;

                this.$super = prototype[name];

                var ret = fn.apply(this, arguments);

                this.$super = tmp;

                return ret;
            };
        })(name, definition[name]);
    }

    function register(Parent, Child) {
        classes.push(Child);
        extensions[classes.indexOf(Child)] = Parent;
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
})();
velcro.defaultBindings = {
    click: velcro.Binding.extend({
        options: {
            block: true,
            propagate: false
        },

        setup: function(app, element, options) {
            velcro.utils.addEvent(element, 'click', function(e) {
                if (options.block) {
                    e.preventDefault();
                }

                if (!options.propagate) {
                    e.stopPropagation();
                }

                options.callback(e);
            });
        }
    }),

    context: velcro.Binding.extend({
        update: function(app, element, options) {
            if (!options.context) {
                velcro.utils.throwForElement(element, 'A context option must be specified.');
            }

            app.context(options.context);
        }
    }),

    each: velcro.Binding.extend({
        app: null,

        clones: null,

        container: null,

        options: {
            key: '$key',
            value: '$value'
        },

        template: null,

        setup: function(app, element, options) {
            this.app       = app;
            this.clones    = [];
            this.container = element.parentNode;
            this.template  = velcro.utils.html(this.clean(app, element));

            velcro.utils.destroyElement(element);
        },

        update: function(app, element, options) {
            var $this = this;

            this.reset(element);

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

                var clone = velcro.utils.createElement($this.template);
                app.bind(clone, context);
                $this.clones.push(clone);
                $this.container.appendChild(clone);

                delete context[$this.options.key];
                delete context[$this.options.value];
            }
        },

        reset: function(element) {
            velcro.utils.each(this.clones, function(index, clone) {
                velcro.utils.destroyElement(clone);
            });

            this.clones = [];

            // previous elements aren't completely destroyed unless this is done
            this.container.innerHTML = '';

            return this;
        },

        clean: function(app, element) {
            element.removeAttribute(app.options.attributePrefix + 'each');
            return element;
        }
    }),

    'if': velcro.Binding.extend({
        container: null,

        html: null,

        index: null,

        setup: function(app, element, options) {
            this.container = element.parentNode;
            this.element   = element;
            this.index     = velcro.utils.elementIndex(element);

            if (!options.test) {
                this.container.removeChild(this.element);
            }
        },

        update: function(app, element, options) {
            if (options.test) {
                if (this.container.childNodes[this.index]) {
                    this.container.insertBefore(this.element, this.container.childNodes[this.index]);
                } else {
                    this.container.appendChild(this.element);
                }
            } else if (this.element.parentNode) {
                this.container.removeChild(this.element);
            }
        }
    }),

    include: velcro.Binding.extend({
        options: {
            path: '',
            context: false,
            callback: function(){},
            view: {}
        },

        update: function(app, element, options) {
            var view = new velcro.View(options.view);

            view.options.target = element;

            if (typeof options.context === 'function') {
                options.context = options.context();
            }

            if (!options.path) {
                velcro.utils.throwForElement(element, 'A path option must be specified.');
            }

            view.render(options.path, function() {
                app.bindDescendants(element, options.context);
                options.callback();
            });
        }
    }),

    routable: velcro.Binding.extend({
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
    }),

    submit: velcro.Binding.extend({
        options: {
            block: true,
            propagate: false
        },

        setup: function(app, element, options, bindings) {
            velcro.utils.addEvent(element, 'submit', function(e) {
                if (options.block) {
                    e.preventDefault();
                }

                if (!options.propagate) {
                    e.stopPropagation();
                }

                options.callback(e);
            });
        }
    }),

    text: velcro.Binding.extend({
        update: function(app, element, options) {
            element.innerText = options.text;
        }
    }),

    value: velcro.Binding.extend({
        options: {
            on: 'change'
        },

        setup: function(app, element, options, bindings) {
            velcro.utils.addEvent(element, options.on, function() {
                bindings.value(element.value);
            });
        },

        update: function(app, element, options, bindings) {
            element.value = options.value;
        }
    })
};
velcro.Event = function() {
    this.stack = [];
    return this;
};

velcro.Event.prototype = {
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
        return this.triggerArgs(Array.prototype.slice.call(arguments, 1));
    },

    triggerArgs: function(args) {
        for (var i in this.stack) {
            if (this.stack[i].apply(this.stack[i], args) === false) {
                return false;
            }
        }

        return this;
    }
};
velcro.Http = function(options) {
    this.before  = new velcro.Event();
    this.after   = new velcro.Event();
    this.success = new velcro.Event();
    this.error   = new velcro.Event();
    this.options = velcro.utils.merge({
        async: true,
        headers: {},
        parsers: { 'application/json': velcro.utils.parseJson },
        prefix: '',
        suffix: ''
    }, options);

    return this;
};

velcro.Http.prototype = {
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
            type: 'GET',
            data: {},
            success: function(){},
            error: function(){},
            before: function(){},
            after: function(){}
        }, options);

        options.type = options.type.toUpperCase();

        if (options.data instanceof velcro.Model) {
            options.data = options.data.raw();
        }

        if (velcro.utils.isObject(options.data)) {
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
var bound = [];

velcro.Router = function(options) {
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

    this.app   = new velcro.App(this.options.app);
    this.state = new velcro.State(this.options.state);
    this.view  = new velcro.View(this.options.view);

    return this;
};

velcro.Router.prototype = {
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

    set: function(name, options) {
        if (typeof options === 'function') {
            options = {
                match: new RegExp('^' + name + "$"),
                format: name,
                controller: options
            };
        }

        if (!options.view) {
            options.view = name || 'index';
        }

        this.routes[name] = options instanceof velcro.Route ? options : new velcro.Route(options);

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

            this.enter.trigger(this, request, route, params);

            this.params         = params;
            this.route          = route;
            this.state.previous = request;

            this.handler(_makeHandler(route));
        }

        return this;

        function _makeHandler(route) {
            return function() {
                $this.renderer(route);
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
};



velcro.Route = function(options) {
    this.options = velcro.utils.merge({
        controller: function(){},
        format: '',
        match: /.*/,
        view: false
    }, options);

    return this;
};

velcro.Route.prototype = {
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
};



var oldState = window.location.hash;
var interval;
var isStarted = false;

velcro.State = function(options) {
    this.options = velcro.utils.merge({
        scroll: false
    });

    this.states = {};

    velcro.State.start();

    return this;
};

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

velcro.State.prototype = {
    previous: false,

    enabled: false,

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
velcro.View = function(options) {
    this.cache = {};

    this.options = velcro.utils.merge({
        idPrefix: 'velcro-view-',
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

    this.http = new velcro.Http(this.options.http);

    return this;
};

velcro.View.prototype = {
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
};
velcro.App = function(options) {
    this.options = velcro.utils.merge({
        attributePrefix: 'data-vc-',
        bindings: velcro.defaultBindings
    }, options);

    this.contexts = [];
};

velcro.App.prototype = {
    bind: function(element, context) {
        if (arguments.length === 1) {
            context = element;
            element = document;
        }

        this.context(context);
        this.bindOne(element);
        this.bindDescendants(element);
        this.restoreContext();

        return this;
    },

    bindDescendants: function(parent, context) {
        var $this   = this;

        if (arguments.length === 1) {
            context = this.context();
        }

        velcro.utils.each(parent.childNodes, function(index, element) {
            $this.bind(element, context);
        });

        return this;
    },

    bindOne: function(element) {
        var $this = this;

        velcro.utils.each(element.attributes, function(i, node) {
            // an element may have been altered inside of a binding, therefore
            // we must check if the binding still exists
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
        if (typeof context === 'object') {
            if (this.contexts.length) {
                context.$parent = this.contexts[this.contexts.length - 1];
                context.$root   = this.contexts[0];
            }

            this.contexts.push(context);

            return this;
        } else {
            return this.contexts.length ? this.contexts[this.contexts.length - 1] : false;
        }
    },

    restoreContext: function() {
        this.contexts.pop();
        return this;
    }
};
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
        var newValue = options.get.call(options.bind);

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

    function defineIfNotDefined(obj) {
        if (!obj.constructor.definition) {
            define(obj);
        }
    }

    function define(obj) {
        initDefinition(obj);
        defineCollection(obj);
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

    function defineCollection(obj) {
        obj.constructor.Collection = velcro.Collection.extend({
            init: function(data) {
                this.$super(obj.constructor, data);
            }
        });
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
            obj[i] = velcro.value({
                bind: obj,
                get: obj.constructor.definition.computed[i].get ? obj.constructor.definition.computed[i].get : generateGetterSetterThrower('getter', i),
                set: obj.constructor.definition.computed[i].set ? obj.constructor.definition.computed[i].set : generateGetterSetterThrower('setter', i)
            });
        }
    }

    function applyMethods(obj) {
        for (var i in obj.constructor.definition.methods) {
            obj[i] = function() {
                obj.constructor.definition.methods[i].apply(obj, Array.prototype.slice.call(arguments));
            };
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

    velcro.Collection.make = function(Model) {
        return this.extend({
            init: function(data) {
                this.$super(Model, data);
            }
        });
    };
})();

});