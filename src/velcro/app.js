(function() {
    vc.App = vc.Class.extend({
        init: function() {
            this.bound = [];
            this.contexts = [];
            currentModule = null;
            previousModule = null;
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
            element = vc.dom(element).raw();

            // Do not bind the same element more than once.
            if (this.bound.indexOf(element) === -1) {
                this.bound.push(element);
            } else {
                return this;
            }

            var module = this.getModuleForElement(element);

            if (module) {
                this.applyModule(element, module);
            } else {
                this.applyBindings(element);
            }

            return this;
        },

        applyModule: function(element, module) {
            var $this = this;
            var name = camelCase(element.nodeName);
            var parents = module.parents;

            // Keep track of which module we are currently rendering.
            this.previousModule = this.currentModule;
            this.currentModule = name;

            // Normalise the container parameter.
            if (typeof parents === 'function') {
                parents = parents();
            }

            if (typeof parents === 'string') {
                parents = [parents];
            }

            // Ensure the module we are applying can be contained within the
            // current module.
            if (parents) {
                if (parents.indexOf(this.previousModule)) {
                    vc.utils.throwForElement(element, 'The module "' + this.currentModule + '" must not be a child of "' + this.previousModule + '". Valid parents are "' + parents.join(', ') + '".');
                }
            }

            // The element we are replacing.
            var domElement = vc.dom(element);

            // Replaces the element with a placeholder.
            var domPlaceholder = domElement.replaceWith('<!-- module -->');

            // The tempalte defaults to the element content.
            var template = domElement.contents();

            // A template specification can either be a string or a function.
            // If it is a function, it's return value is used as the template.
            // If it does not return anything, it is given a second argument
            // that it can use to render the descendant bindings.
            if (typeof module.template === 'string') {
                template = module.template;
            } else if (typeof module.template === 'function') {
                template = module.template(template, render);
            }

            // A module does not require a controller. If no controller
            // is specified, then the current context is simply passed
            // on to the module. If a controller is present, the current
            // context is passed to it and the return value from the
            // controller is used as the context that is passed to the
            // descendant modules and bindings.
            if (typeof module.controller === 'function') {
                context = module.controller(context);
            }

            // Only render a template if something was returned,
            // otherwise assume the template is using the renderer.
            if (template) {
                render(template);
            }

            // Reset the currently rendering module.
            this.currentModule = this.previousModule;

            // This is used to bind the rest of the module contents.
            // If a template is returned, this is called immediately.
            // If a template does not return anything, it is up to the
            // template to ensure this is called. This allows for asyc
            // templates to be used.
            function render(template) {
                $this.bind(domPlaceholder.replaceWith(template), context);
            }
        },

        applyBindings: function(element) {
            var bindings = this.getBindingsForElement(element);

            for (var name in bindings) {
                this.applyBinding(element, name, bindings[name], this.context());
            }

            return this;
        },

        applyBinding: function(element, name, value, context) {
            var $this = this;
            var parsed = this.parseBinding(value, context);

            if (typeof vc.bindings[name] !== 'function') {
                vc.utils.throwForElement(element, 'The binding "' + name + '" must be a constructor.');
            }

            var binding = new vc.bindings[name](this, element);

            // Initialisation.
            if (typeof binding.init === 'function') {
                binding.init(vc.utils.merge(binding.options, parsed.options), parsed.bound);
            } else if (typeof binding.update === 'function') {
                binding.update(vc.utils.merge(binding.options, parsed.options), parsed.bound);
            }

            // If an update method is provided, subscribe to updates with it.
            if (typeof binding.update === 'function') {
                for (var i in parsed.bound) {
                    parsed.bound[i].subscribe(subscriber);
                }
            }

            return this;

            // Triggers updates within the binding when a observer changes.
            function subscriber() {
                var refreshed = $this.parseBinding(value, context);
                binding.update(vc.utils.merge(binding.options, refreshed.options), refreshed.bound);
            }
        },

        // Returns an object that conains raw, extracted values from the passed in bindings as well as bindable members.
        // Bindable members included any vc.value, vc.Model and vc.Collection.
        parseBinding: function(value, context) {
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
        },

        getModuleForElement: function(element) {
            var nodeName = camelCase(element.nodeName);

            if (typeof vc.modules[nodeName] === 'function') {
                return new vc.modules[nodeName](this);
            }
        },

        getBindingsForElement: function(element) {
            var bindings = {};

            if (element.attributes) {
                for (var a = 0; a < element.attributes.length; a++) {
                    var attr = element.attributes[a];
                    var name = camelCase(attr.nodeName);
                    var value = attr.nodeValue;

                    if (typeof vc.bindings[name] === 'function') {
                        bindings[name] = value;
                    }
                }
            }

            return bindings;
        }
    });

    vc.app = function(element, context) {
        var app = new vc.App();

        switch (arguments.length) {
            case 0:
                element = document;
                context = window;
            break;
            case 1:
                if (typeof element === 'object') {
                    context = element;
                    element = document;
                } else {
                    context = window;
                }
            break;
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

    function camelCase(dashCase) {
        dashCase = dashCase.toLowerCase();

        if (dashCase.indexOf('-') === -1) {
            return dashCase;
        }

        var parts = dashCase.split('-');

        for (var a = 1; a < parts.length; a++) {
            parts[a] = parts[a].charAt(0).toUpperCase() + parts[a].substring(1);
        }

        return parts.join('');
    }
})();