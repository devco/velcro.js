define(['moment', 'velcro', 'views/todo'], function(moment, velcro, TodoView) {
    return velcro.Model.extend({
        todos: velcro.Collection.make(TodoView),
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