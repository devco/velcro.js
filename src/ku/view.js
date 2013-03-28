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

        if (this.cache[name]) {
            this.renderer(this.cache[name]);
            callback.call(this, name);
        } else if (document.getElementById(id)) {
            this.renderer(this.cache[name] = document.getElementById(id).innerHTML);
            callback.call(this, name);
        } else if (this.http) {
            this.http.get(name, function(html) {
                $this.renderer($this.cache[name] = html);
                callback.call($this, name);
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