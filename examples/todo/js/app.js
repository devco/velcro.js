require.config({
    paths: {
        moment: '../../../components/moment/moment',
        velcro: '../../../dist/velcro'
    }
});

require([
    'velcro',
    'views/app'
], function(velcro, AppView) {
    new velcro.App().bind(new AppView);
});