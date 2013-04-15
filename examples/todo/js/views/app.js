define(['moment', 'velcro', 'views/todo'], function(moment, Velcro, TodoView) {
    return Velcro.Model.extend({
        todos: Velcro.Collection.make(TodoView),
        todoToAdd: '',
        addTodo: function() {
            this.todos().append({
                name: this.todoToAdd(),
                created: moment().format()
            });

            this.todoToAdd('');
        }
    });
});