(function() {
    module('Objects');

    test('Extension', function() {
        var MyObj1 = vc.Class.extend();
        var MyObj2 = MyObj1.extend();
        var MyObj3 = MyObj2.extend();
        var ArbitraryObj = vc.Class.extend();

        var obj3 = new MyObj3;

        ok(MyObj3.prototype instanceof MyObj2, 'Prototype should be an instance of previous constructor.');
        ok(MyObj3.prototype instanceof MyObj1, 'Prototype should be an instance of root constructor.');
        ok(!(MyObj1.prototype instanceof ArbitraryObj), 'Separate object should not be related.');
        ok(obj3 instanceof MyObj1, 'Should be instance of 1st object.');
        ok(obj3 instanceof MyObj2, 'Should be instance of 2nd object.');
        ok(obj3 instanceof MyObj3, 'Should be instance of 3rd object.');
    });
})();