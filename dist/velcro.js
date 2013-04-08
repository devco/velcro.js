!function(factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        factory(module.exports || exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory(window.Velcro = {});
    }
}(function(Velcro) {

Velcro.utils = {
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

    html: function(element) {
        var div = document.createElement('div');
        div.appendChild(element);
        return div.innerHTML;
    },

    isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },

    isClass: function(obj) {
        return typeof obj === 'function' && typeof obj.extend === 'function' && obj.extend === Velcro.Class.extend;
    },

    isObject: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    },

    isValue: function(value) {
        return typeof value === 'function' && value.toString() === Velcro.value().toString();
    },

    merge: function() {
        var merged = {};

        for (var i = 0; i < arguments.length; i++) {
            var param = arguments[i];

            if (!Velcro.utils.isObject(param)) {
                continue;
            }

            for (var ii in param) {
                var value = param[ii];

                if (Velcro.utils.isObject(value)) {
                    if (typeof merged[ii] === 'undefined') {
                        merged[ii] = value;
                    } else {
                        merged[ii] = Velcro.utils.merge(merged[ii], value);
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

    throwForElement: function(element, message) {
        throw message + "\n" + Velcro.html(element);
    }
};
var context = function(app, element, options) {
    if (!options.context) {
        Velcro.utils.throwForElement(element, 'A context option must be specified.');
    }

    app.context(options.context);
};

var include = function(app, element, options) {
    options = Velcro.utils.merge({
        path: '',
        context: false,
        callback: function(){},
        view: {}
    }, options);

    var view = new Velcro.View(options.view);

    view.options.target = element;

    if (typeof options.context === 'function') {
        options.context = options.context();
    }

    if (!options.path) {
        Velcro.utils.throwForElement(element, 'A path option must be specified.');
    }

    view.render(options.path, function() {
        app.bindDescendants(element, options.context);
        options.callback();
    });
};

var routable = function(app, element, options) {
    var router = options.router;

    if (!router) {
        Velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" because it does not exist.');
    }

    if (!router instanceof Velcro.Router) {
        Velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" because it is not an instanceof "Velcro.Router".');
    }

    router.view.options.target = element;
    router.bind();
};

var text = function(app, element, options) {
    element.innerText = options.text;
};

Velcro.defaultBindings = {
    context: context,
    include: include,
    routable: routable,
    text: text
};
(function() {
    Velcro.Class = function() {};

    var extending  = false;
    var classes    = [];
    var extensions = {};

    Velcro.Class.extend = function(definition) {
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
            return Parent === Velcro.Class || Parent === Ancestor || Parent.isSubClassOf(Ancestor);
        };

        Child.prototype.$self = Child;

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
Velcro.Event = function() {
    this.stack = [];
    return this;
};

Velcro.Event.prototype = {
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
var bound = [];

Velcro.Router = function(options) {
    this.options = Velcro.utils.merge({
        app: {},
        state: {},
        view: {}
    }, options);

    this.enter  = new Velcro.Event();
    this.exit   = new Velcro.Event();
    this.render = new Velcro.Event();

    this.params = {};
    this.route  = false;
    this.routes = {};

    this.app   = new Velcro.App(this.options.app);
    this.state = new Velcro.State(this.options.state);
    this.view  = new Velcro.View(this.options.view);

    return this;
};

Velcro.Router.prototype = {
    handler: function(execute) {
        execute();
    },

    renderer: function(route, params) {
        var $this   = this;
        var context = route.options.controller.apply(route.options.controller, params);

        if (!context instanceof Velcro.Model) {
            context = new (Velcro.model(context))();
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
            options.view = name;
        }

        this.routes[name] = options instanceof Velcro.Route ? options : new Velcro.Route(options);

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

        var executor = function() {
            $this.renderer(route);
        };

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

            this.handler(executor);
        }

        return this;
    },

    go: function(name, params, data) {
        this.state.push(this.get(name).generate(params), data);
        return this;
    },

    generate: function(name, params) {
        return this.get(name).generate(params);
    }
};



Velcro.Route = function(options) {
    this.options = Velcro.utils.merge({
        controller: function(){},
        format: '',
        match: /.*/,
        view: false
    }, options);

    return this;
};

Velcro.Route.prototype = {
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

Velcro.State = function(options) {
    this.options = Velcro.utils.merge({
        scroll: false
    });

    this.states = {};

    Velcro.State.start();

    return this;
};

Velcro.State.interval = 500;

Velcro.State.start = function() {
    if (isStarted) {
        return Velcro.State;
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
        }, Velcro.State.interval);
    }

    isStarted = true;

    return Velcro.State;
};

Velcro.State.stop = function() {
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

Velcro.State.prototype = {
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
Velcro.View = function(options) {
    this.cache = {};

    this.options = Velcro.utils.merge({
        idPrefix: 'Velcro-view-',
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

    this.http = new Velcro.Http(this.options.http);

    return this;
};

Velcro.View.prototype = {
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
Velcro.App = function(options) {
    this.options = Velcro.utils.merge({
        attributePrefix: 'data-velcro-',
        bindings: Velcro.defaultBindings
    }, options);

    this.contexts = [];
};

Velcro.App.prototype = {
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
        var $this = this;

        Velcro.utils.each(parent.childNodes, function(index, element) {
            $this.bind(element, context);
        });

        return this;
    },

    bindOne: function(element) {
        var $this = this;

        Velcro.utils.each(element.attributes, function(i, node) {
            var name = node.nodeName.substring($this.options.attributePrefix.length);

            if (typeof $this.options.bindings[name] === 'function') {
                $this.bindAttribute(element, name, node.nodeValue);
            }
        });

        return this;
    },

    bindAttribute: function (element, name, value) {
        var $this   = this;
        var parsed  = Velcro.utils.parseBinding(value, this.context());
        var binding = this.options.bindings[name];

        Velcro.utils.each(parsed, function(parsedName, parsedValue) {
            subscribeToUpdatesIfObservable(parsedValue);
        });

        initialiseBinding();

        return this;

        function initialiseBinding() {
            var options = extractObservableValues();

            if (typeof binding.init === 'function') {
                binding.init.call(binding, $this, element, options);
            } else {
                binding.call(binding, $this, element, options);
            }
        }

        function subscribeToUpdatesIfObservable(value) {
            if (!Velcro.utils.isValue(value)) {
                return;
            }

            value.subscribe(function() {
                var options = extractObservableValues();

                if (typeof binding.update === 'function') {
                    binding.update.call(binding, $this, element, options);
                } else {
                    binding.call(binding, $this, element, options);
                }
            });
        }

        function extractObservableValues() {
            var options = {};

            Velcro.utils.each(parsed, function(name, value) {
                if (Velcro.utils.isValue(value)) {
                    options[name] = value();
                } else {
                    options[name] = value;
                }
            });

            return options;
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
Velcro.value = function(options) {
    var subs  = [];
    var value = null;

    if (!Velcro.utils.isObject(options)) {
        options = { defaultValue: options };
    }

    options = Velcro.utils.merge({
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
        return func;
    };

    func.unsubscribe = function(callback) {
        for (var i = 0; i < subs.length; i++) {
            if (callback === subscriber) {
                subs.splice(index, 1);
                return;
            }
        }
        return func;
    };

    func.publish = function() {
        for (var i = 0; i < subs.length; i++) {
            subs[i](func.value);
        }
        return func;
    };

    return func;
};

(function() {
    Velcro.Model = Velcro.Class.extend({
        $observer: null,

        init: function(data) {
            defineIfNotDefined(this);
            applyDefinition(this);
            this.from(data);
        },

        clone: function() {
            return new this.$self(this.to());
        },

        each: function(fn) {
            var def = this.$self.definition;

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

            if (obj instanceof Velcro.Model) {
                obj = obj.to();
            }

            this.each(function(name, value) {
                if (typeof obj[name] !== 'undefined') {
                    value(obj[name]);
                }
            });

            this.$observer.publish();

            return this;
        },

        to: function() {
            var out = {};

            this.each(function(name, value) {
                out[name] = value();
            });

            return out;
        }
    });

    function defineIfNotDefined(obj) {
        if (!obj.$self.definition) {
            define(obj);
        }
    }

    function define(obj) {
        initDefinition(obj);
        defineCollection(obj);
        definePrototype(obj);
    }

    function initDefinition(obj) {
        obj.$self.definition = {
            relations: {},
            properties: {},
            computed: {}
        };
    }

    function defineCollection(obj) {
        obj.$self.Collection = Velcro.Collection.extend({
            init: function(data) {
                this.$super(obj.$self, data);
            }
        });
    }

    function definePrototype(obj) {
        for (var i in obj) {
            if (typeof Velcro.Model.prototype[i] !== 'undefined') {
                continue;
            }

            var v = obj[i];

            if (Velcro.utils.isClass(v) && (v.isSubClassOf(Velcro.Model) || v.isSubClassOf(Velcro.Collection))) {
                obj.$self.definition.relations[i] = v;
                continue;
            }

            if (typeof v === 'function') {
                var name, type;

                if (i.indexOf('get') === 0) {
                    name = i.substring(3, 4).toLowerCase() + i.substring(4);
                    type = 'get';
                } else if (i.indexOf('set') === 0) {
                    name = i.substring(3, 4).toLowerCase() + i.substring(4);
                    type = 'set';
                }

                if (!type) {
                    continue;
                }

                if (typeof obj.$self.definition.computed[name] === 'undefined') {
                    obj.$self.definition.computed[name] = {};
                }

                obj.$self.definition.computed[name][type] = v;

                continue;
            }

            obj.$self.definition.properties[i] = v;
        }
    }

    function applyDefinition(obj) {
        applyObserver(obj);
        applyRelations(obj);
        applyProperties(obj);
        applyComputed(obj);
    }

    function applyObserver(obj) {
        obj.$observer = Velcro.value({
            bind: obj,
            defaultValue: obj,
            set: function(value) {
                this.from(value);
            }
        });
    }

    function applyRelations(obj) {
        for (var i in obj.$self.definition.relations) {
            var instance     = new obj.$self.definition.relations[i]();
            instance.$parent = obj;
            obj[i]           = instance.$observer;

            console.log(i + ': ' + instance.$observer);
        }
    }

    function applyProperties(obj) {
        for (var i in obj.$self.definition.properties) {
            obj[i] = Velcro.value({
                bind: obj,
                defaultValue: obj.$self.definition.properties[i]
            });
        }
    }

    function applyComputed(obj) {
        for (var i in obj.$self.definition.computed) {
            obj[i] = Velcro.value({
                bind: obj,
                get: obj.$self.definition.computed[i].get ? obj.$self.definition.computed[i].get : generateGetterSetterThrower('getter', i),
                set: obj.$self.definition.computed[i].set ? obj.$self.definition.computed[i].set : generateGetterSetterThrower('setter', i)
            });
        }
    }

    function generateGetterSetterThrower(type, name) {
        return function() {
            throw 'No ' + type + ' defined for computed property "' + name + '".';
        };
    }
})();
(function() {
    Velcro.Collection = Velcro.Class.extend({
        init: function(Model, data) {
            Array.prototype.push.apply(this, []);

            this.$observer = Velcro.value({
                bind: this,
                defaultValue: this,
                set: function(value) {
                    this.from(value);
                }
            });

            this.Model = Model;

            this.from(data);
        },

        aggregate: function(joiner, fields) {
            var arr = [];

            if (!fields) {
                fields = [joiner];
                joiner = '';
            }

            this.Velcro.utils.each(function(k, model) {
                var parts = [];

                Velcro.utils.each(fields, function(kk, field) {
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
                this.$observer.publish();
            }

            return this;
        },

        empty: function() {
            Array.prototype.splice.call(this, 0, this.length);
            this.$observer.publish();

            return this;
        },

        prepend: function(item) {
            return this.insert(0, item);
        },

        append: function(item) {
            return this.insert(this.length, item);
        },

        insert: function(at, item) {
            item         = item instanceof Velcro.Model ? item : new this.Model(item);
            item.$parent = this.$parent;

            Array.prototype.splice.call(this, at, 0, item);
            this.$observer.publish();

            return this;
        },

        replace: function (at, item) {
            item         = item instanceof Velcro.Model ? item : new this.Model(item);
            item.$parent = this.$parent;

            Array.prototype.splice.call(this, at, 1, item);
            this.$observer.publish();

            return this;
        },

        index: function(item) {
            var index = -1;

            this.Velcro.utils.each(function(i, it) {
                if (it === item) {
                    index = i;
                    return;
                }
            });

            return index;
        },

        from: function(data) {
            var that = this;

            if (Velcro.utils.isCollection(data)) {
                data = data.to();
            }

            Velcro.utils.each(data, function(i, model) {
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

            this.Velcro.utils.each(function(i, v) {
                out.push(v.to());
            });

            return out;
        },

        each: function(fn) {
            for (var i = 0; i < this.length; i++) {
                fn.call(this, i, this[i]);
            }
            return this;
        },

        find: function(query, limit, page) {
            var collection     = new Velcro.Collection(this.Model);
            collection.$parent = this.$parent;

            if (query instanceof Velcro.Model) {
                query = query.to();
            }

            if (typeof query === 'object') {
                query = (function(query) {
                    return function() {
                        var that = this,
                            ret  = true;

                        Velcro.utils.each(query, function(k, v) {
                            if (typeof that[k] === 'undefined' || that[k]() !== v) {
                                ret = false;
                                return false;
                            }
                        });

                        return ret;
                    };
                })(query);
            }

            this.Velcro.utils.each(function(i, model) {
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
})();

});