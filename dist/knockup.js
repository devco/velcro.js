!function(factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        factory(module.exports || exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory(window.ku = {});
    }
}(function(ku) {

ku.App = function() {
    this.attributePrefix  = 'data-ku-';
    this.bindings         = ku.defaultBindings;
    this.context          = {
        $parent: false,
        $root: false
    };
};

ku.App.prototype = {
    bind: function(element, context) {
        if (arguments.length === 1) {
            context = element;
            element = document;
        }

        this.bindOne(element, context);
        this.bindDescendants(element, context);

        return this;
    },

    bindOne: function(element, context) {
        var $this = this;

        each(element.attributes, function(i, node) {
            var name = node.nodeName.substring($this.attributePrefix.length);

            if (typeof $this.bindings[name] === 'function') {
                $this.bindAttribute(element, context, name, node.nodeValue);
            }
        });

        return this;
    },

    bindDescendants: function(parent, context) {
        var $this = this;

        each(parent.childNodes, function(index, element) {
            $this.bind(element, context);
        });

        return this;
    },

    bindAttribute: function (element, context, name, value) {
        this.setContext(context);

        var $this   = this;
        var parsed  = ku.utils.parseBinding(value, context);
        var binding = $this.bindings[name];

        each(parsed, function(index, value) {
            subscribeToUpdatesIfObservable(value);
        });

        initialiseBinding();

        return this.restoreContext();

        function initialiseBinding() {
            var options = extractObservableValues();

            if (typeof binding.init === 'function') {
                binding.init.call(binding, $this, element, options);
            } else {
                binding.call(binding, $this, element, options);
            }
        }

        function subscribeToUpdatesIfObservable(value) {
            if (!ku.utils.isObservable(value)) {
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

            each(parsed, function(index, value) {
                if (ku.utils.isObservable(value)) {
                    options[index] = value();
                } else {
                    options[index] = value;
                }
            });

            return options;
        }
    },

    setContext: function(context) {
        if (typeof context === 'object') {
            context.$parent = this.context;
            context.$root   = this.context.$root || this.context;
            this.context    = context;
        }

        return this;
    },

    getContext: function() {
        return this.context;
    },

    restoreContext: function() {
        if (typeof this.context.$parent === 'object') {
            this.setContext(this.context.$parent);
        }

        return this;
    }
};
ku.collection = function(model) {
    var Collection = function(data) {
        Array.prototype.push.apply(this, []);

        this.observer = generateValueObserver(this);

        this.aggregate = function(joiner, fields) {
            var arr = [];

            if (!fields) {
                fields = [joiner];
                joiner = '';
            }

            this.each(function(k, model) {
                var parts = [];

                each(fields, function(kk, field) {
                    if (typeof model[field] === 'function') {
                        parts.push(model[field]());
                    }
                });

                arr.push(parts.join(joiner));
            });

            return arr;
        };

        this.at = function(index) {
            return typeof this[index] === 'undefined' ? false : this[index];
        };

        this.first = function() {
            return this.at(0);
        };

        this.last = function() {
            return this.at(this.length - 1);
        };

        this.has = function(index) {
            return typeof this[index] !== 'undefined';
        };

        this.remove = function(at) {
            at = typeof at === 'number' ? at : this.index(at);

            if (this.has(at)) {
                Array.prototype.splice.call(this, at, 1);

                this.observer.publish();
            }

            return this;
        };

        this.empty = function() {
            Array.prototype.splice.call(this, 0, this.length);
            this.observer.publish();

            return this;
        };

        this.prepend = function(item) {
            return this.insert(0, item);
        };

        this.append = function(item) {
            return this.insert(this.length, item);
        };

        this.insert = function(at, item) {
            item         = ku.utils.isModel(item) ? item : new model(item);
            item.$parent = this.$parent;

            Array.prototype.splice.call(this, at, 0, item);
            this.observer.publish();

            return this;
        };

        this.replace = function (at, item) {
            item         = ku.utils.isModel(item) ? item : new model(item);
            item.$parent = this.$parent;

            Array.prototype.splice.call(this, at, 1, item);
            this.observer.publish();

            return this;
        };

        this.index = function(item) {
            var index = -1;

            this.each(function(i, it) {
                if (it === item) {
                    index = i;
                    return;
                }
            });

            return index;
        };

        this.from = function(data) {
            var that = this;

            if (ku.utils.isCollection(data)) {
                data = data.raw();
            }

            each(data, function(i, model) {
                if (that.has(i)) {
                    that.replace(i, model);
                } else {
                    that.replace(i, model);
                }
            });

            return this;
        };

        this.raw = function() {
            var out = [];

            this.each(function(i, v) {
                out.push(v.raw());
            });

            return out;
        };

        this.each = function(fn) {
            for (var i = 0; i < this.length; i++) {
                fn.call(this, i, this[i]);
            }
            return this;
        };

        this.find = function(query, limit, page) {
            var collection     = new this.$self.Model.Collection();
            collection.$parent = this.$parent;

            if (ku.utils.isModel(query)) {
                query = query.raw();
            }

            if (typeof query === 'object') {
                query = (function(query) {
                    return function() {
                        var that = this,
                            ret  = true;

                        each(query, function(k, v) {
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
        };

        this.findOne = function(query) {
            return this.find(query, 1).first();
        };

        // alias deprecated methods
        this['export'] = this.raw;
        this['import'] = this.from;

        this.from(data);
    };

    Collection.Model = model;

    Collection.prototype = {
        $self: Collection
    };

    return Collection;
};
var context = function(app, element, options) {
    app.setContext(options.context);
};

var include = function(app, element, options) {
    var view = options.view || new ku.View();

    app = options.app || app;

    view.target = element;

    view.render(options.path, function() {
        app.bindDescendants(element);
    });
};

var routable = function(app, element, options) {
    var router = options.router;

    if (!router) {
        ku.utils.throwForElement(element, 'Cannot bind router "' + value + '" to the main view because it does not exist.');
    }

    if (!router instanceof ku.Router) {
        ku.utils.throwForElement(element, 'Cannot bind router "' + value + '" to the main view because it is not an instanceof "ku.Router".');
    }

    router.view.target = element;
    router.bind();
};

var text = function(app, element, options) {
    element.innerText = options.text;
};

ku.defaultBindings = {
    context: context,
    include: include,
    routable: routable,
    text: text
};
ku.Event = function() {
    this.stack = [];
    return this;
};

ku.Event.prototype = {
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

    trigger: function(args) {
        for (var i in this.stack) {
            if (this.stack[i].apply(this, args) === false) {
                return false;
            }
        }
    }
};
ku.Events = function() {
    this.events = {};
    return this;
};

ku.Events.prototype = {
    on: function(name, handler) {
        if (typeof this.events[name] === 'undefined') {
            this.events[name] = new ku.Event();
        }

        this.events[name].bind(handler);

        return this;
    },

    off: function(name, handler) {
        if (!name) {
            this.events = {};
            return this;
        }

        if (typeof this.events[name] !== 'undefined') {
            this.events[name].unbind(handler);
        }

        return this;
    },

    trigger: function(name, args) {
        if (typeof this.events[name] !== 'undefined') {
            if (this.events[name].trigger(args) === false) {
                return false;
            }
        }
    }
};
ku.Http = function() {
    this.events = new ku.Events();
    return this;
};

ku.Http.prototype = {
    prefix: '',

    suffix: '',

    headers: {},

    parsers: {
        'application/json': function(response) {
            try {
                return JSON.parse(response);
            } catch (error) {
                throw 'Error parsing response "' + response + '" with message "' + error + '".';
            }
        }
    },

    'delete': function(url, data, fn) {
        return this.request(url, data || {}, 'delete', fn || data);
    },

    get: function(url, data, fn) {
        return this.request(url, data || {}, 'get', fn || data);
    },

    head: function(url, data, fn) {
        return this.request(url, data || {}, 'head', fn || data);
    },

    options: function(url, data, fn) {
        return this.request(url, data || {}, 'options', fn || data);
    },

    patch: function(url, data, fn) {
        return this.request(url, data, 'patch', fn);
    },

    post: function(url, data, fn) {
        return this.request(url, data, 'post', fn);
    },

    put: function(url, data, fn) {
        return this.request(url, data, 'put', fn);
    },

    request: function(url, data, type, fn) {
        var $this   = this,
            request = this.createRequestObject();

        request.open(type.toUpperCase(), this.prefix + url + this.suffix, true);

        for (var header in this.headers) {
            request.setRequestHeader(header, this.headers[header]);
        }

        request.onreadystatechange = function () {
            if (request.readyState !== 4) {
                return;
            }

            if (request.status !== 200 && request.status !== 304) {
                $this.events.trigger('error', [request]);
                $this.events.trigger('stop', [request]);
                return;
            }

            var response = request.responseText,
                headers  = request.getAllResponseHeaders();

            if (typeof headers['Content-Type'] === 'string' && typeof $this.parsers[headers['Content-Type']] === 'function') {
                response = $this.parsers[headers['Content-Type']](response);
            } else if (typeof $this.headers.Accept === 'string' && typeof $this.parsers[$this.headers.Accept] === 'function') {
                response = $this.parsers[$this.headers.Accept](response);
            }

            if (typeof fn === 'function') {
                fn(response, request);
            }

            $this.events.trigger('success', [response, request]);
            $this.events.trigger('stop', [request]);
        };

        if (request.readyState === 4) {
            return;
        }

        if (ku.utils.isModel(data)) {
            data = data.raw();
        }

        if (typeof data === 'object') {
            data = this.serialize(data);
        }

        if (data) {
            request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        }

        this.events.trigger('start', [request]);
        request.send(data);

        return this;
    },

    serialize: function(obj, prefix) {
        var str = [];

        for (var p in obj) {
            var k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];
            str.push(typeof v === 'object' ? this.serialize(v, k) : encodeURIComponent(k) + '=' + encodeURIComponent(v));
        }

        return str.join('&');
    },

    createRequestObject: function() {
        var request   = false;
            factories = [
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
};

function fnCompare(fn, str) {
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
}

function each(items, fn) {
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
}

function generateValueObserver(obj) {
    var value = ku.value();

    value.bind = obj;

    value.get = function() {
        return this;
    };

    value.set = function(value) {
        this.from(value);
    };

    return value;
}
ku.model = function(definition) {
    var Model = function(data) {
        var that = this;

        this.clone = function() {
            var clone     = new Model(this.raw());
            clone.$parent = this.$parent;
            return clone;
        };

        this.from = function(obj) {
            if (ku.utils.isModel(obj)) {
                obj = obj.raw();
            }

            each(obj, function(name, value) {
                if (typeof that[name] === 'function') {
                    that[name](value);
                }
            });

            this.observer.publish();

            return this;
        };

        this.raw = function() {
            var out = {};

            each(that.$self.properties, function(i, v) {
                out[i] = that[i]();
            });

            each(that.$self.computed, function(i, v) {
                out[i] = that[i]();
            });

            each(that.$self.relations, function(i, v) {
                out[i] = that[i]().raw();
            });

            return out;
        };

        this.reset = function() {
            each(that.$self.properties, function(i, v) {
                that[i](v);
            });

            return this;
        };

        // alias deprecated methods
        this['export'] = this.raw;
        this['import'] = this.from;

        define(this);
        this.from(data);

        if (typeof this.init === 'function') {
            this.init();
        }
    };

    Model.Collection      = ku.collection(Model);
    Model.computed        = {};
    Model.methods         = {};
    Model.properties      = {};
    Model.relations       = {};
    Model.prototype.$self = Model;

    Model.extend = function(OtherModel) {
        OtherModel = ku.utils.isModel(OtherModel) ? OtherModel : ku.model(OtherModel);

        each(Model.computed, function(i, v) {
            if (typeof OtherModel.computed[i] === 'undefined') {
                OtherModel.computed[i] = v;
            }
        });

        each(Model.methods, function(i, v) {
            if (typeof OtherModel.methods[i] === 'undefined') {
                OtherModel.methods[i] = v;
            }
        });

        each(Model.properties, function(i, v) {
            if (typeof OtherModel.properties[i] === 'undefined') {
                OtherModel.properties[i] = v;
            }
        });

        each(Model.relations, function(i, v) {
            if (typeof OtherModel.relations[i] === 'undefined') {
                OtherModel.relations[i] = v;
            }
        });

        return OtherModel;
    };

    Model.inherit = function(OtherModel) {
        return OtherModel.extend(Model);
    };

    interpretDefinition(Model, definition);

    return Model;
};

function interpretDefinition(Model, definition) {
    each(definition, function(i, v) {
        if (ku.utils.isModel(v) || ku.utils.isCollection(v)) {
            Model.relations[i] = v;
            return;
        }

        if (typeof v === 'function') {
            var name, type;

            if (ku.utils.isReader(i)) {
                name = ku.utils.fromReader(i);
                type = 'get';
            } else if (ku.utils.isWriter(i)) {
                name = ku.utils.fromWriter(i);
                type = 'set';
            }

            if (type) {
                if (typeof Model.computed[name] === 'undefined') {
                    Model.computed[name] = {};
                }

                Model.computed[name][type] = v;
                return;
            }

            Model.methods[i] = v;
            return;
        }

        Model.properties[i] = v;
    });
}

function define(obj) {
    obj.observer = generateValueObserver(obj);

    defineComputed(obj);
    defineMethods(obj);
    defineProperties(obj);
    defineRelations(obj);
}

function defineComputed(obj) {
    each(obj.$self.computed, function(name, computed) {
        obj[name] = ku.value({
            bind: obj,
            get: computed.get,
            set: computed.set
        });
    });
}

function defineMethods(obj) {
    each(obj.$self.methods, function(name, method) {
        obj[name] = function() {
            return method.apply(obj, arguments);
        };
    });
}

function defineProperties(obj) {
    each(obj.$self.properties, function(name, property) {
        obj[name] = ku.value({
            value: property
        });
    });
}

function defineRelations(obj) {
    each(obj.$self.relations, function(name, relation) {
        var instance     = new relation();
        obj[name]        = instance.observer;
        instance.$parent = obj;
    });
}
var bound = [];

ku.Router = function() {
    this.app    = new ku.App();
    this.events = new ku.Events();
    this.params = {};
    this.route  = false;
    this.routes = {};
    this.state  = new ku.State();
    this.view   = new ku.View();

    return this;
};

ku.Router.prototype = {
    handler: function(execute) {
        execute();
    },

    renderer: function(route, params) {
        var $this = this;

        this.app.context = route.controller.apply(route.controller, params);
        this.app.context = new (ku.model(this.app.context))();

        this.view.render(route.view, function() {
            $this.app.bindDescendants(this.target);
            $this.events.trigger('render', [$this, route, params]);
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

        this.routes[name] = options instanceof ku.Route ? options : new ku.Route(options);

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
                this.events.trigger('exit', [this, this.state.previous, this.route, this.params]);
            }

            this.events.trigger('enter', [this, request, route, params]);

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



ku.Route = function(options) {
    for (var i in options) {
        this[i] = options[i];
    }

    return this;
};

ku.Route.prototype = {
    match: /.*/,

    format: '',

    view: false,

    controller: function(){},

    query: function(request) {
        var params = request.match(this.match);

        if (params === null) {
            return false;
        }

        params.shift();

        return params;
    },

    generate: function(params) {
        var format = this.format;

        for (var name in params) {
            format = format.replace(new RegExp('\\:' + name, 'g'), params[name]);
        }

        return format;
    }
};



var oldState = window.location.hash;

var interval;

var isStarted = false;

ku.State = function() {
    this.states = {};
    ku.State.start();
    return this;
};

ku.State.interval = 500;

ku.State.start = function() {
    if (isStarted) {
        return ku.State;
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
        }, ku.State.interval);
    }

    isStarted = true;

    return ku.State;
};

ku.State.stop = function() {
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

ku.State.prototype = {
    previous: false,

    enabled: false,

    scroll: false,

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
            updateHash(uri, this.scroll);
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
ku.utils = {
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

    isObservable: function(value) {
        return typeof value === 'function' && value.toString() === ku.value().toString();
    },

    html: function(element) {
        var div = document.createElement('div');
        div.appendChild(element);
        return div.innerHTML;
    },

    throwForElement: function(element, message) {
        throw message + "\n" + ku.html(element);
    },

    isReader: function(name) {
        return name.indexOf('read') === 0;
    },

    isWriter: function(name) {
        return name.indexOf('write') === 0;
    },

    toReader: function(name) {
        return 'read' + name.substring(0, 1).toUpperCase() + name.substring(1);
    },

    toWriter: function(name) {
        return 'write' + name.substring(0, 1).toUpperCase() + name.substring(1);
    },

    fromReader: function(name) {
        return name.substring(4, 5).toLowerCase() + name.substring(5);
    },

    fromWriter: function(name) {
        return name.substring(5, 6).toLowerCase() + name.substring(6);
    },

    isModel: function(fn) {
        return fnCompare(fn, ku.model().toString());
    },

    isCollection: function(fn) {
        return fnCompare(fn, ku.collection().toString());
    }
};
ku.value = function(options) {
    var func = function(value) {
        if (arguments.length === 0) {
            return func.get.call(func.bind);
        } else {
            func.set.call(func.bind, value);
            func.publish();
            return func.bind;
        }
    };

    if (!options) {
        options = {};
    }

    if (typeof options.get !== 'function') {
        options.get = function() {
            return func.value;
        };
    }

    if (typeof options.set !== 'function') {
        options.set = function(value) {
            func.value = value;
        };
    }

    var _subscribers = [];

    func.value = options.value;
    func.bind  = options.bind;
    func.get   = options.get;
    func.set   = options.set;

    func.subscribe = function(callback) {
        _subscribers.push(callback);
        return func;
    };

    func.unsubscribe = function(callback) {
        each(_subscribers, function(index, subscriber) {
            if (callback === subscriber) {
                _subscribers.splice(index, 1);
                return;
            }
        });

        return func;
    };

    func.publish = function() {
        each(_subscribers, function(index, subscriber) {
            subscriber(func.value);
        });
    };

    return func;
};
ku.View = function() {
    this.cache       = {};
    this.http        = new ku.Http();
    this.http.prefix = 'views/';
    this.http.suffix = '.html';
    this.http.accept = 'text/html';

    return this;
};

ku.View.prototype = {
    http: false,

    target: null,

    idPrefix: 'ku-view-',

    idSuffix: '',

    idSeparator: '-',

    render: function(name, callback) {
        var $this = this;
        var id    = this.idPrefix + name.replace(/\//g, this.idSeparator) + this.idSuffix;
        var cb    = function() {
            if (typeof callback === 'function') {
                callback.call($this, name);
            }
        };

        if (this.cache[name]) {
            this.renderer(this.cache[name]);
            cb();
        } else if (document.getElementById(id)) {
            this.renderer(this.cache[name] = document.getElementById(id).innerHTML);
            cb();
        } else if (this.http) {
            this.http.get(name, function(html) {
                $this.renderer($this.cache[name] = html);
                cb();
            });
        }

        return this;
    },

    renderer: function(view) {
        var target = this.target;

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

});