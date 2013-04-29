define(['models/todo', 'moment', 'velcro'], function(TodoModel, moment, vc) {
    return TodoModel.extend({
        humanFriendlyCreated: vc.value('computed', {
            use: ['created'],
            read: function() {
                return moment(this.created()).fromNow();
            }
        }),
        setup: function() {
            this.humanFriendlyCreated.updateEvery(5000);
        },
        remove: function() {
            this.parent().todos().remove(this);
        }
    });
});