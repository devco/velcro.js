!function(factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        factory(module.exports || exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory(window.vc = {});
    }
}(function(vc) {
{content}

// Allow a velcro configuration object to be defined.
if (typeof window.velcro === 'object') {
    var config = vc.utils.merge({
        autorun: true
    }, window.velcro);

    if (config.autorun) {
        vc.app();
    }
}
});