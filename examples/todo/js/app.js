require.config({
    paths: {
        moment: '../../../components/moment/moment',
        velcro: '../../../dist/velcro'
    }
});

require([
    'velcro',
    'views/app'
], function(Velcro, AppView) {
    new Velcro.App().bind(new AppView);
});