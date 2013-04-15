require.config({
    paths: {
        moment: '../../components/moment/moment',
        velcro: '../../dist/velcro'
    }
});

require(['velcro', 'services/router'], function(velcro, router) {
    var app = new velcro.App;
    app.bind({
        router: router
    });
});