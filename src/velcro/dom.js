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