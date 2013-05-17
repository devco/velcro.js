(function() {
    module('Views');

    test('No Model Binding', function() {
        var view = new vc.View();

        view.options.target = document.createElement('div');
        view.cache.test     = 'test';

        view.render('test');

        ok(view.options.target.innerHTML === 'test', 'The view should render without a bound model.');
    });
})();