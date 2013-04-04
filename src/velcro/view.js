velcro.View = function() {
    this.cache       = {};
    this.http        = new velcro.Http();
    this.http.prefix = 'views/';
    this.http.suffix = '.html';
    this.http.accept = 'text/html';

    return this;
};

velcro.View.prototype = {
    http: false,

    target: null,

    idPrefix: 'velcro-view-',

    idSuffix: '',

    idSeparator: '-',

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