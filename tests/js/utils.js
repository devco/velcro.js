(function() {
    module('Utils');

    test('Object Merging', function() {
        var merged = vc.utils.merge({
            prop1: 'old',
            prop3: { prop1: 'old', prop3: [ 1 ] },
        }, {
            prop1: 'new',
            prop2: 'new',
            prop3: { prop1: 'new', prop2: 'new', prop3: [ 1, 2 ] },
        });

        ok(merged.prop1 === 'new', 'Shallow properties not merged.');
        ok(merged.prop2 === 'new', 'Shallow properties not added.');
        ok(merged.prop3.prop1 === 'new', 'Deep properties not merged.');
        ok(merged.prop3.prop2 === 'new', 'Deep properties not added');
        ok(merged.prop3.prop3.length === 2, 'Arrays should be overridden.');
    });
})();