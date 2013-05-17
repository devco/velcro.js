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

        removeAttributes: function() {
            if (this.element.attributes) {
                for (var a = 0; a < this.element.attributes.length; a++) {
                    this.attr(this.element.attributes[a].nodeName, '');
                }
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

        once: function(name, callback) {
            var $this = this;

            this.on(name, function(e) {
                $this.off(name, callback);
                callback(e);
            });

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
            this.removeAttributes();
            this.empty();

            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            return this;
        },

        empty: function() {
            if (this.element.childNodes) {
                for (var b = 0; b < this.element.childNodes.length; b++) {
                    vc.dom(this.element.childNodes[b]).destroy();
                }
            }

            this.element.innerHTML = '';

            return this;
        },

        html: function() {
            var div = document.createElement(detectParentTagName(this.element.nodeName));
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
            return this.element.nodeName.toLowerCase();
        },

        replaceWith: function(element) {
            element = vc.dom(element);
            this.element.parentNode.insertBefore(element.raw(), this.element);
            this.destroy();
            return element;
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