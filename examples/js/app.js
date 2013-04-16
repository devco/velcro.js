require.config({
    paths: {
        bootstrap: '../../components/bootstrap/docs/assets/js/bootstrap.min',
        jquery: '../../components/jquery/jquery.min',
        moment: '../../components/moment/min/moment.min',
        velcro: '../../dist/velcro.min'
    },
    shim: {
        bootstrap: ['jquery']
    }
});

require(['bootstrap']);
require(['velcro', 'services/router'], function(velcro, router) {
    var app = new velcro.App;
    app.bind({
        router: router
    });
});