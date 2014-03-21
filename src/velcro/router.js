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
            this.enabled = options.enabled || false;
            
            this.options = vc.utils.merge({
                scroll: false
            });

            this.states = {};

            vc.State.start();

            return this;
        },

        get: function() {
            if (this.enabled && window.history.pushState) {
                return window.location.pathname.substring(1);
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