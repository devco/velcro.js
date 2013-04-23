velcro.View = function(options) {
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