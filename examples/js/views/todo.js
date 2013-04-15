define(['models/todo', 'moment'], function(TodoModel, moment) {
    return TodoModel.extend({
        setup: function() {
            this.humanFriendlyCreated.updateEvery(5000);
        },
        getHumanFriendlyCreated: function() {
            return moment(this.created()).fromNow();
        },
        setHumanFriendlyCreated: function(created){},
        remove: function() {
            this.parent().todos().remove(this);
        }
    });
});