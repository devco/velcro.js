define(['velcro', 'views/examples/todo'], function(vc, ExamplesTodoView) {
    return function() {
        return {
            todos: vc.value('many', { model: ExamplesTodoView }),
            adding: vc.value('string'),
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