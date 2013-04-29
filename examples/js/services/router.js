define([
    'velcro',
    'controllers/examples/todo'
], function(
    vc,
    ExamplesTodoController
) {
    var router = new vc.Router;

    router.set('');
    router.set('documentation/overview');
    router.set('documentation/guide');
    router.set('documentation/api');
    router.set('examples/todo', ExamplesTodoController);

    return router;
});