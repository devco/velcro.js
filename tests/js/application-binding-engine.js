(function() {
    module('Application / Binding Engine');

    test('Observing Changes', function() {
        var div  = document.createElement('div');
        var span = document.createElement('span');

        span.setAttribute('vc-content', 'text: name');
        div.appendChild(span);

        var Person = vc.Model.extend({
            name: vc.value('string', { value: 'Default Value' })
        });

        var dude = new Person;

        vc.app(div, dude);
        ok(div.childNodes[0].innerText === dude.name(), 'Inner text on div child should be initialised.');

        dude.name('Updated Value');
        ok(div.childNodes[0].innerText === dude.name(), 'Inner text on div child should be updated.');
    });

    test('Changing Context and Scoping', function() {
        var app = new vc.App();

        app.context({ trunk: true });
        app.context({ branch: true });
        app.context({ leaf: true });

        ok(app.context().leaf, 'Leaf should be current.');
        ok(app.context().$parent.branch, 'Branch should be $parent.');
        ok(app.context().$root.trunk, 'Trunk should be $root.');
    });

    asyncTest('Router', function() {
        var div = document.createElement('div');
        div.setAttribute('vc-routable', 'router: router');

        var router = new vc.Router();

        router.set('index', function() {
            return {
                name: 'test'
            };
        });

        router.render.bind(function() {
            ok(div.childNodes[0].innerHTML === 'test', 'Inner text on div\'s child span should update.');
            start();
        });

        vc.app(div, {
            router: router
        });

        router.go('index');
    });

    asyncTest('View', function() {
        var div = document.createElement('div');
        div.setAttribute('vc-include', 'path: "index", context: context, callback: callback');

        vc.app(div, {
            context: function() {
                return { name: 'test' };
            },
            callback: function() {
                ok(div.childNodes[0].innerHTML === 'test', 'Inner text on div\'s child span should initialise.');
                start();
            }
        });
    });
})();