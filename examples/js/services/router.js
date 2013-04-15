define([
    'velcro',
    'controllers/index',
    'controllers/todo'
], function(
    velcro,
    IndexController,
    TodoController
) {
    var router = new velcro.Router;

    router.set('', IndexController);
    router.set('todo', TodoController);

    return router;
});