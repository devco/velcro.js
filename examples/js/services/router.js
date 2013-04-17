define([
    'velcro',
    'controllers/examples/todo'
], function(
    velcro,
    ExamplesTodoController
) {
    var router = new velcro.Router;

    router.set('');
    router.set('documentation/overview');
    router.set('documentation/guide');
    router.set('documentation/api');
    router.set('examples/todo', ExamplesTodoController);

    return router;
});