define(['moment', 'velcro'], function(moment, vc) {
    return vc.Model.extend({
        name: vc.value('string'),
        created: vc.value({
            get: function() {
                return this.value;
            },
            set: function(created) {
                this.value = moment(created).format();
            }
        })
    });
});