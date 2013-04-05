!function(factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        factory(module.exports || exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory(window.velcro = {});
    }
}(function(velcro) {

velcro.App = function() {
    this.attributePrefix  = 'data-velcro-';
    this.bindings         = velcro.defaultBindings;
    this.contexts         = [];
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
        var $this = this;

        each(parent.childNodes, function(index, element) {
            $this.bind(element, context);
        });

        return this;
    },

    bindOne: function(element) {
        var $this = this;

        each(element.attributes, function(i, node) {
            var name = node.nodeName.substring($this.attributePrefix.length);

            if (typeof $this.bindings[name] === 'function') {
                $this.bindAttribute(element, name, node.nodeValue);
            }
        });

        return this;
    },

    bindAttribute: function (element, name, value) {
        var $this   = this;
        var parsed  = velcro.utils.parseBinding(value, this.context());
        var binding = this.bindings[name];

        each(parsed, function(parsedName, parsedValue) {
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
            if (!velcro.utils.isObservable(value)) {
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

            each(parsed, function(name, value) {
                if (velcro.utils.isObservable(value)) {
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
velcro.collection = function(model) {
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
            item         = velcro.utils.isModel(item) ? item : new model(item);
            item.$parent = this.$parent;

            Array.prototype.splice.call(this, at, 0, item);
            this.observer.publish();

            return this;
        };

        this.replace = function (at, item) {
            item         = velcro.utils.isModel(item) ? item : new model(item);
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

            if (velcro.utils.isCollection(data)) {
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

            if (velcro.utils.isModel(query)) {
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
    app.context(options.context);
};

var include = function(app, element, options) {
    var view    = options.view || new velcro.View();
    var subApp  = options.app || app;
    var context = options.context;
    view.target = element;

    if (typeof context === 'function') {
        context = context();
    }

    view.render(options.path, function() {
        app.bindDescendants(element, context);

        if (typeof options.callback === 'function') {
            options.callback();
        }
    });
};

var routable = function(app, element, options) {
    var router = options.router;

    if (!router) {
        velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" because it does not exist.');
    }

    if (!router instanceof velcro.Router) {
        velcro.utils.throwForElement(element, 'Cannot bind router "' + value + '" because it is not an instanceof "velcro.Router".');
    }

    router.view.target = element;
    router.bind();
};

var text = function(app, element, options) {
    element.innerText = options.text;
};

velcro.defaultBindings = {
    context: context,
    include: include,
    routable: routable,
    text: text
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

        if (velcro.utils.isModel(options.data)) {
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
    return velcro.value({
        value: obj,
        bind: obj,
        set: function(value) {
            this.from(value);
        }
    });
}
velcro.model = function(definition) {
    var Model = function(data) {
        var that = this;

        this.clone = function() {
            var clone     = new Model(this.raw());
            clone.$parent = this.$parent;
            return clone;
        };

        this.from = function(obj) {
            if (velcro.utils.isModel(obj)) {
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

    Model.Collection      = velcro.collection(Model);
    Model.computed        = {};
    Model.methods         = {};
    Model.properties      = {};
    Model.relations       = {};
    Model.prototype.$self = Model;

    Model.extend = function(OtherModel) {
        OtherModel = velcro.utils.isModel(OtherModel) ? OtherModel : velcro.model(OtherModel);

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
        if (velcro.utils.isModel(v) || velcro.utils.isCollection(v)) {
            Model.relations[i] = v;
            return;
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
        obj[name] = velcro.value({
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
        obj[name] = velcro.value({
            bind: obj,
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

velcro.Router = function() {
    this.app    = new velcro.App();
    this.enter  = new velcro.Event();
    this.exit   = new velcro.Event();
    this.params = {};
    this.render = new velcro.Event();
    this.route  = false;
    this.routes = {};
    this.state  = new velcro.State();
    this.view   = new velcro.View();

    return this;
};

velcro.Router.prototype = {
    handler: function(execute) {
        execute();
    },

    renderer: function(route, params) {
        var $this   = this;
        var context = route.controller.apply(route.controller, params);

        if (!velcro.utils.isModel(context)) {
            context = new (velcro.model(context))();
        }

        this.view.render(route.view, function(view) {
            $this.app.bindDescendants(view.target, context);
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



velcro.Route = function(options) {
    for (var i in options) {
        this[i] = options[i];
    }

    return this;
};

velcro.Route.prototype = {
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

velcro.State = function() {
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
velcro.utils = {
    isObservable: function(value) {
        return typeof value === 'function' && value.toString() === velcro.value().toString();
    },

    html: function(element) {
        var div = document.createElement('div');
        div.appendChild(element);
        return div.innerHTML;
    },

    throwForElement: function(element, message) {
        throw message + "\n" + velcro.html(element);
    },

    isModel: function(fn) {
        return fnCompare(fn, velcro.model().toString());
    },

    isCollection: function(fn) {
        return fnCompare(fn, velcro.collection().toString());
    },

    isObject: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    },

    isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },

    merge: function() {
        var merged  = arguments[0];
        var params = Array.prototype.slice.call(arguments, 1);

        for (var i = 0; i < params.length; i++) {
            var param = params[i];

            if (!velcro.utils.isObject(param)) {
                continue;
            }

            for (var ii in param) {
                var value = param[ii];

                if (velcro.utils.isObject(value)) {
                    if (typeof merged[ii] === 'undefined') {
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
    }
};
velcro.value = function(options) {
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
        return func;
    };

    return func;
};
velcro.View = function(options) {
    this.cache  = {};
    this.target = false;
    this.http   = new velcro.Http({
        prefix: 'views/',
        suffix: '.html',
        headers: {
            Accept: 'text/html'
        }
    });
    this.options = velcro.utils.merge({
        idPrefix: 'velcro-view-',
        idSuffix: '',
        idSeparator: '-'
    }, options);

    return this;
};

velcro.View.prototype = {
    render: function(name, callback) {
        var $this = this;
        var id    = this.idPrefix + name.replace(/\//g, this.idSeparator) + this.idSuffix;
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