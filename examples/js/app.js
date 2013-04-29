require.config({
    paths: {
        bootstrap: '../../components/bootstrap/docs/assets/js/bootstrap',
        jquery: '../../components/jquery/jquery',
        less: '../../components/less.js/dist/less-1.3.3',
        moment: '../../components/moment/moment',
        velcro: '../../dist/velcro'
    },
    shim: {
        bootstrap: ['jquery'],
        velcro: ['jquery']
    }
});

require(['bootstrap', 'less']);
require(['velcro', 'services/router'], function(vc, router) {
    var app = new vc.App;
    app.bind({
        router: router
    });
});