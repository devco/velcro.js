define(['velcro', 'views/todo'], function(velcro, TodoView) {
    return function() {
        return {
            todos: velcro.Collection.make(TodoView),
            todoToAdd: '',
            addTodo: function() {
                this.todos().append({
                    name: this.todoToAdd(),
                    created: moment().format()
                });

                this.todoToAdd('');
            }
        };
    };
});