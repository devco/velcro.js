(function() {
    vc.modules.vcTest1 = function() {};

    vc.modules.vcTest2 = function() {
        this.template = '<span>test</span>';
    };

    vc.modules.vcTest3 = function() {
        this.template = function(content) {
            return '<span>' + content + '</span>';
        };
    };

    vc.modules.vcTest4 = function() {
        this.template = function(content, render) {
            render('<span>' + content + '</span>');
        };
    };

    vc.modules.vcTest5 = function() {
        this.controller = function(context) {
            return context;
        }
    };

    module('Modules');

    test('Empty', function() {
        var dom = vc.dom('<div><vc-test1><span>test</span></vc-test1></div>');
        vc.app(dom);
        ok(dom.html() === '<div><span>test</span></div>', dom.html());
    });

    test('Template String', function() {
        var dom = vc.dom('<div><vc-test2>test</vc-test2></div>');
        vc.app(dom);
        ok(dom.html() === '<div><span>test</span></div>', dom.html());
    });

    test('Template Function Returning String', function() {
        var dom = vc.dom('<div><vc-test3>test</vc-test3></div>');
        vc.app(dom);
        ok(dom.html() === '<div><span>test</span></div>', dom.html());
    });

    test('Template Function Calling Render', function() {
        var dom = vc.dom('<div><vc-test4>test</vc-test4></div>');
        vc.app(dom);
        ok(dom.html() === '<div><span>test</span></div>', dom.html());
    });

    test('Controller Returning Context', function() {
        var dom = vc.dom('<div><vc-test5 text="text"><span vc-content="text: text"></span></vc-test5></div>');
        vc.app(dom, {
            text: 'test'
        });
        ok(dom.html() === '<div><span vc-content="text: text">test</span></div>', dom.html());
    });
})();