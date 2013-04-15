define(['moment', 'velcro'], function(moment, velcro) {
    return velcro.Model.extend({
        _created: '',
        name: '',
        getCreated: function() {
            return this._created();
        },
        setCreated: function(created) {
            this._created(moment(created).format());
        }
    });
});