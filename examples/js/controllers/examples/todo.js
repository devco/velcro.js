define(['velcro', 'views/examples/todo'], function(velcro, ExamplesTodoView) {
    return function() {
        return {
            todos: velcro.Collection.make(ExamplesTodoView),
            adding: '',
            create: function() {
                this.todos().append({
                    name: this.adding(),
                    created: moment().format()
                });

                this.adding('');
            }
        };
    };
});