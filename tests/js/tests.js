var _undefined;



module('Utils');

test('Object Merging', function() {
    var merged = velcro.utils.merge({
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



module('Objects');

test('Extension', function() {
    var MyObj1 = velcro.Class.extend({
        method1: function() {
            return 'test1';
        },
        method2: function() {
            return 'test';
        }
    });

    var MyObj2 = MyObj1.extend({
        method2: function() {
            return this.$super() + '2';
        }
    });

    var MyObj3 = MyObj2.extend({
        method3: function() {
            return 'test3';
        }
    });

    var obj3 = new MyObj3;

    ok(velcro.Model.isSubClassOf(velcro.Class), 'velcro.Model should be a subclass of velcro.Class.');
    ok(MyObj1.isSubClassOf(velcro.Model), 'MyObj1 should be a subclass of velcro.Model.');
    ok(MyObj2.isSubClassOf(MyObj1), 'MyObj2 should be a subclass of MyObj1.');
    ok(MyObj3.isSubClassOf(velcro.Class), 'MyObj3 should be a subclass of velcro.Class.');
    ok(obj3 instanceof MyObj1, 'Should be instance of 1st object.');
    ok(obj3 instanceof MyObj2, 'Should be instance of 2nd object.');
    ok(obj3 instanceof MyObj3, 'Should be instance of 3rd object.');
    ok(obj3.method1() === 'test1', 'Inherited method not working.');
    ok(obj3.method2() === 'test2', 'Overridden method not working.');
    ok(obj3.method3() === 'test3', 'Third level method not working.');
});



module('Models and Collections');

test('Default Values', function() {
    var Model = velcro.Model.extend({
        value: 'default'
    });

    var modelInstance = new Model;

    ok(modelInstance.value() === 'default', 'Default value not set.');
});

test('Defining', function() {
    var User = velcro.Model.extend({
        forename: '',
        surname: '',
        getName: function() {
            return this.forename() + ' ' + this.surname();
        },
        setName: function(name) {
            var names = name.split(' ');
            this.forename(names[0]);
            this.surname(names[1]);
        }
    });

    var bob1 = new User({
        name: 'Bob Bobberson'
    });

    var bob2 = new User({
        name: 'Bob Bobberson'
    });

    ok(velcro.utils.isValue(bob1.forename), 'The forename property should be an observable.');
    ok(velcro.utils.isValue(bob1.surname), 'The surname property should be an observable.');
    ok(velcro.utils.isValue(bob1.name), 'The name property should be a computed observable.');

    ok(bob1.forename() === 'Bob', 'Forename should be Bob.');
    ok(bob1.surname() === 'Bobberson', 'Surname should be Bobberson.');
    ok(bob1.name() === 'Bob Bobberson', 'Full name should be Bob Bobberson.');

    bob1.name('Marge Margaretson');

    ok(bob2.forename() === 'Bob', 'Second Bob should still be named Bob.');
    ok(bob1.forename() === 'Marge', 'Forename should have changed to Marge.');
    ok(bob1.surname() === 'Margaretson', 'Surname should have changed to Margaretson.');
    ok(bob1.name() === 'Marge Margaretson', 'Full name should have changed to Marge Margaretson.');
});

test('Relationships', function() {
    var Friend = velcro.Model.extend({
        name: ''
    });

    var User = velcro.Model.extend({
        bestFriend: Friend,
        friends: velcro.Collection.make(Friend)
    });

    var user = new User();

    user.bestFriend({
        name: 'Dog'
    });

    user.friends([
        { name: 'Cat' },
        { name: 'Lizard' }
    ]);

    var exported = user.to();

    ok(exported.bestFriend.name === user.bestFriend().name(), 'Dog should be the best friend.');
    ok(exported.friends[0].name === user.friends().first().name(), 'Cat should be 2nd best.');
    ok(exported.friends[1].name === user.friends().at(1).name(), 'Lizard should be 3rd best.');
});

test('Collection Manipulation', function() {
    var Item = velcro.Model.extend({
        name: ''
    });

    var Items = velcro.Model.extend({
        items: velcro.Collection.make(Item)
    });

    var model = new Items;

    model.items([{
        name: 'test1',
    }, {
        name: 'test2'
    }]);

    ok(model.items().length === 2, 'Items not set.');

    model.items([{
        name: 'test1',
    }, {
        name: 'test2'
    }]);

    ok(model.items().length === 2, 'Items should be replaced when directly set.');
});

test('Observable Getters and Setters', function() {
    var Getter = velcro.Model.extend({
        _prop: true,
        getProp: function() {
            return this._prop();
        }
    });

    var Setter = velcro.Model.extend({
        _prop: false,
        setProp: function(prop) {
            this._prop(prop);
        }
    });

    var GetterAndSetter = velcro.Model.extend({
        _prop: false,
        getProp: function() {
            return this._prop();
        },
        setProp: function(prop) {
            this._prop(prop);
        }
    });

    var model = new Getter();
    ok(model.prop(), 'Getter without setter not working.');

    var model = new Setter();
    model.prop(true);
return;
    ok(model._prop(), 'Setter without getter not working.');

    var model = new GetterAndSetter();
    model.prop(true);
    ok(model.prop(), 'Getter and setter not working.');
});

test('Parent / Child Relationships', function() {
    var LeafModel = velcro.Model.extend({
        test: function() {
            ok(this instanceof LeafModel, 'Using `this` in a method should refer to current model.');
            ok(this.parent() instanceof BranchModel, 'Using `this.parent()` in a method should refer to the correct parent.');
            ok(this.parent().parent() instanceof TrunkModel, 'Correct ancestor not found.');
        }
    });

    var BranchModel = velcro.Model.extend({
        leaf: LeafModel,
        leafs: velcro.Collection.make(LeafModel)
    });

    var TrunkModel = velcro.Model.extend({
        leaf: LeafModel,
        leafs: velcro.Collection.make(LeafModel),
        branch: BranchModel,
        branches: velcro.Collection.make(BranchModel)
    });

    var trunk = new TrunkModel({
        leaf: {},
        leafs: [{}],
        branch: {
            leaf: {},
            leafs: [{}]
        },
        branches: [{
            leaf: {},
            leafs: [{}]
        }]
    });

    ok(trunk.leaf().parent() instanceof TrunkModel, 'Trunk -> Leaf -> parent() -> Trunk');
    ok(trunk.leafs().at(0).parent() instanceof TrunkModel, 'Trunk -> Leafs -> 0 -> parent() -> Trunk');
    ok(trunk.branch().parent() instanceof TrunkModel, 'Trunk -> Branch -> parent() -> Trunk');
    ok(trunk.branch().leaf().parent() instanceof BranchModel, 'Trunk -> Branch -> Leaf -> parent() -> Branch');
    ok(trunk.branch().leafs().at(0).parent() instanceof BranchModel, 'Trunk -> Branch -> Leafs -> 0 -> parent() -> Branch');
    ok(trunk.branches().at(0).parent() instanceof TrunkModel, 'Trunk -> Branches -> 0 -> parent() -> Trunk');
    ok(trunk.branches().at(0).leaf().parent() instanceof BranchModel, 'Trunk -> Branches -> 0 -> Leaf -> parent() -> Branch');
    ok(trunk.branches().at(0).leafs().at(0).parent() instanceof BranchModel, 'Trunk -> Branches -> 0 -> Leafs -> 0 -> parent() -> Branch');

    trunk.branch().leaf().test();
    trunk.branch().leafs().at(0).test();
    trunk.branches().at(0).leaf().test();
    trunk.branches().at(0).leafs().at(0).test();
});

test('Chaining Method Calls', function() {
    var Model = velcro.Model.extend({
        test1: '',
        test3: '',
        getTest2: function() {
            return this.test3();
        },
        setTest2: function(value) {
            this.test3(value);
        }
    });

    var test = new Model;

    ok(test.test1('test') instanceof Model, 'Observable property is not chainable.');
    ok(test.test2('test') instanceof Model, 'Observable setter is not chainable.');
});

test('Rebinding Methods to Model Instance', function() {
    var Model = velcro.Model.extend({
        test: function() {
            ok(this instanceof Model, 'Using `this` inside of a model method should refer to the model instance in which it is defined.');
        }
    });

    var model = new Model;
    model.test();
});



module('Views');

test('No Model Binding', function() {
    var view = new velcro.View();

    view.options.target = document.createElement('div');
    view.cache.test     = 'test';

    view.render('test');

    ok(view.options.target.innerHTML === 'test', 'The view should render without a bound model.');
});



module('Http');

asyncTest('Parsing Based on Request Header', function() {
    var http = new velcro.Http({
        headers: {
            Accept: 'application/json'
        }
    });

    http.get({
        url: 'data/bob.json',
        success: function(response) {
            ok(response.name === 'Bob Bobberson', 'JSON object should be properly parsed.');
        },
        after: function() {
            start();
        },
        error: function(request) {
            ok(false, request.statusText)
        }
    });
});



module('Application / Binding Engine');

test('Observing Changes', function() {
    var div  = document.createElement('div');
    var span = document.createElement('span');

    span.setAttribute('data-vc-contents', 'text: name');
    div.appendChild(span);

    var Person = velcro.Model.extend({
        name: 'Default Value'
    });

    var dude = new Person;

    new velcro.App().bind(div, dude);

    ok(div.childNodes[0].innerText === dude.name(), 'Inner text on div child should be initialised.');

    dude.name('Updated Value');

    ok(div.childNodes[0].innerText === dude.name(), 'Inner text on div child should be updated.');
});

test('Changing Context and Scoping', function() {
    var app = new velcro.App();

    app.context({ trunk: true });
    app.context({ branch: true });
    app.context({ leaf: true });

    ok(app.context().leaf, 'Leaf should be current.');
    ok(app.context().$parent.branch, 'Branch should be $parent.');
    ok(app.context().$root.trunk, 'Trunk should be $root.');
});

asyncTest('Router', function() {
    var div = document.createElement('div');
    div.setAttribute('data-vc-routable', 'router: router');

    var app    = new velcro.App()
    var router = new velcro.Router();

    router.set('index', function() {
        return {
            name: 'test'
        };
    });

    router.render.bind(function() {
        ok(div.childNodes[0].innerHTML === 'test', 'Inner text on div\'s child span should update.');
        start();
    });

    app.bind(div, {
        router: router
    });

    router.go('index');
});

asyncTest('View', function() {
    var div = document.createElement('div');
    div.setAttribute('data-vc-include', 'path: "index", context: context, callback: callback');

    new velcro.App().bind(div, {
        context: function() {
            return { name: 'test' };
        },
        callback: function() {
            ok(div.childNodes[0].innerHTML === 'test', 'Inner text on div\'s child span should initialise.');
            start();
        }
    });
});

test('Document Binding - Passing Shallow Contexts to Nested Elements', function() {
    document.body.innerHTML = '<ul data-vc-if="test: test"><li data-vc-each="items: items"></li></ul>';

    new velcro.App().bind({
        test: true,
        items: [
            'Item 1',
            'Item 2'
        ]
    });

    ok(true);
});



module('Bindings');

test('attr', function() {
    var div   = velcro.dom('<div data-vc-attr="\'class\': className, title: title"></div>');
    var app   = new velcro.App;
    var model = new (velcro.Model.extend({
        className: 'test-class1',
        title: 'test title 1'
    }));

    app.bind(div.raw(), model);

    ok(div.attr('class') === 'test-class1', 'Class attribute not initialised.');
    ok(div.attr('title') === 'test title 1', 'Title attribute not initialised.');

    model.className('test-class2');
    model.title('test title 2');

    ok(div.attr('class') === 'test-class2', 'Class attribute not changed.');
    ok(div.attr('title') === 'test title 2', 'Title attribute not changed.');
});

test('click', function() {
    var div = velcro.dom('<div data-vc-click="callback: test"></div>');
    var app = new velcro.App;
    var yes = false;

    app.bind(div.raw(), {
        test: function() {
            yes = true;
        }
    });

    div.fire('click');
    ok(yes, 'Click not triggered.');
});

test('context', function() {
    var div  = document.createElement('div');
    var span = document.createElement('span');

    div.setAttribute('data-vc-context', 'context: person');
    span.setAttribute('data-vc-contents', 'text: name');
    div.appendChild(span);

    var App = velcro.Model.extend({
        person: velcro.Model.extend({
            name: 'Default Value'
        })
    });

    var appsrawesome = new App;

    new velcro.App().bind(div, appsrawesome)
    ok(div.childNodes[0].innerText === appsrawesome.person().name(), 'Inner text on div child should be initialised.');

    appsrawesome.person().name('Updated Value');

    ok(div.childNodes[0].innerText === appsrawesome.person().name(), 'Inner text on div child should be updated.');
});

test('css', function() {
    var div   = velcro.dom('<div data-vc-css="class1: class1, class2: class2"></div>');
    var app   = new velcro.App;
    var model = new (velcro.Model.extend({
        class1: 'test-class1',
        class2: 'test-class2'
    }));

    app.bind(div.raw(), model);

    ok(div.attr('class').split(' ')[0] === model.class1(), 'Class not initialised.');
    ok(div.attr('class').split(' ')[1] === model.class2(), 'Class not initialised.');

    model.class1('test-class1-updated');
    model.class2('test-class2-updated');

    ok(div.attr('class').split(' ')[0] === model.class1(), 'Class not updated.');
    ok(div.attr('class').split(' ')[1] === model.class2(), 'Class not updated.');
});

test('each', function() {
    var ul   = document.createElement('ul');
    var li   = document.createElement('li');
    var Item = velcro.Model.extend({
        text: ''
    });

    ul.appendChild(li);
    li.setAttribute('data-vc-each', 'items: items');
    li.setAttribute('data-vc-contents', 'text: text');

    var ctx = { items: new velcro.Collection(Item) };
    var app = new velcro.App().bind(ul, ctx);

    ctx.items.append({
        text: 'Item 1'
    });

    ok(ul.childNodes[0].innerText === 'Item 1', 'One item should exist as "Item 1".');

    ctx.items.append({
        text: 'Item 2'
    });

    ok(ul.childNodes[1].innerText === 'Item 2', 'Two items should exist as "Item 1, Item 2".');
});

test('extend', function() {
    var html  = velcro.dom('<div><div data-vc-extend="path: path">test</div><script id="vc-view-layout1" type="text/html"><h1 data-vc-contents="html: $content"></h1></script><script id="vc-view-layout2" type="text/html"><h2 data-vc-contents="html: $content"></h2></script></div>');
    var app   = new velcro.App();
    var model = new (velcro.Model.extend({
        path: 'layout1'
    }));

    document.body.appendChild(html.raw());
    app.bind(html.raw(), model);

    ok(html.raw().childNodes[0].childNodes[0].tagName === 'H1', 'The layout was not initialised.');

    model.path('layout2');
    ok(html.raw().childNodes[0].childNodes[0].tagName === 'H2', 'The layout was not updated.');
});

test('html', function() {
    var div   = velcro.dom('<div data-vc-contents="html: html"></div>');
    var app   = new velcro.App();
    var model = new (velcro.Model.extend({
        html: '<ul></ul>'
    }));

    app.bind(div.raw(), model);
    ok(div.raw().innerHTML === model.html(), 'HTML was not initialised.');

    model.html('<ol></ol>');
    ok(div.raw().innerHTML === model.html(), 'HTML was not updated.');
});

test('if', function() {
    var div   = velcro.dom('<div><ul data-vc-if="test: show"></ul></div>');
    var app   = new velcro.App();
    var model = new (velcro.Model.extend({
        show: false
    }));

    app.bind(div.raw(), model);
    ok(div.raw().childNodes[0].style.display = 'none');

    model.show(true);
    ok(div.raw().childNodes[0].style.display = 'block');
});

test('include', function() {
    var div   = velcro.dom('<div><div data-vc-include="path: path"></div><script id="vc-view-child1" type="text/html">child1</script><script id="vc-view-child2" type="text/html">child2</script></div>');
    var app   = new velcro.App();
    var model = new (velcro.Model.extend({
        path: 'child1'
    }));

    document.body.appendChild(div.raw());
    app.bind(div.raw(), model);
    ok(div.raw().childNodes[0].innerHTML === 'child1', 'Include not initialised.');

    model.path('child2');
    ok(div.raw().childNodes[0].innerHTML === 'child2', 'Include not initialised.');
});

test('on', function() {
    var div   = velcro.dom('<div data-vc-on="event: event, callback: callback"></div>');
    var app   = new velcro.App();
    var model = new (velcro.Model.extend({
        event: 'shown',
        triggered: [],
        callback: function(e) {
            this.triggered().push(this.event());
        }
    }));

    app.bind(div.raw(), model);

    div.fire('shown');
    ok(model.triggered().indexOf(model.event()) !== -1, 'Event ' + model.event() + ' not triggered.');

    model.event('hidden');
    div.fire('hidden');
    ok(model.triggered().indexOf(model.event()) !== -1, 'Event ' + model.event() + ' not triggered.');
});

/*
test('options', function() {
    var select = velcro.dom('<select data-vc-options="options: options, caption: caption, text: text, value: value"></select>');
    var app    = new velcro.App();
    var model  = new (velcro.Model.extend({
        caption: 'Choose...',
        options: velcro.Model.extend({
            text: '',
            value: ''
        }),
        text: function(option) {
            return option.text;
        },
        value: function(option) {
            return option.value;
        }
    }));

    app.bind(select.raw(), model);
    ok(select.contents() === '', 'Select should be empty.');

    model.options([{
        text: 'Option 1',
        value: 0
    }, {
        text: 'Option 2',
        value: 1
    }]);

    ok(select.raw().childNodes[0].innerText === 'Option 1', 'Option text not updated.');
    ok(select.raw().childNodes[0].value === '0', 'Option value not updated.');
    ok(select.raw().childNodes[1].innerText === 'Option 1', 'Option text not updated.');
    ok(select.raw().childNodes[1].value === '1', 'Option value not updated.');
});
*/

test('routable', function() {
    var div   = velcro.dom('<div><div data-vc-routable="router: router"></div><script id="vc-view-test" type="text/html"><span data-vc-contents="text: text"></span></script></div>');
    var app   = new velcro.App();
    var model = new (velcro.Model.extend({
        router: new velcro.Router
    }));

    model.router().set('test1', {
        view: 'test',
        controller: function() {
            return {
                text: 'test1'
            }
        }
    });

    model.router().set('test2', {
        view: 'test',
        controller: function() {
            return {
                text: 'test2'
            }
        }
    });

    document.body.appendChild(div.raw());
    app.bind(div.raw(), model);

    model.router().dispatch('test1');
    ok(div.raw().childNodes[0].childNodes[0].innerText === 'test1', 'Router not initialised.');

    model.router().dispatch('test2');
    ok(div.raw().childNodes[0].childNodes[0].innerText === 'test2', 'Router not updated.');
});

test('submit', function() {
    var form = velcro.dom('<form data-vc-submit="callback: callback"></form>');
    var app   = new velcro.App();
    var model = new (velcro.Model.extend({
        submitted: false,
        callback: function() {
            this.submitted(true);
        }
    }));

    app.bind(form.raw(), model);
    form.fire('submit');
    ok(model.submitted(), 'Form not submitted.');
});

test('text', function() {
    var div   = velcro.dom('<div data-vc-contents="text: text"></div>');
    var app   = new velcro.App();
    var model = new (velcro.Model.extend({
        text: 'test1'
    }));

    app.bind(div.raw(), model);
    ok(div.raw().innerText === 'test1', 'Text not initialised.');

    model.text('test2');
    ok(div.raw().innerText === 'test2', 'Text not updated.');
});

test('value', function() {
    var input = velcro.dom('<input type="text" data-vc-value="value: value">');
    var app   = new velcro.App();
    var model = new (velcro.Model.extend({
        value: 'test1'
    }));

    app.bind(input.raw(), model);
    ok(input.raw().value === 'test1', 'Value not initialised.');

    model.value('test2');
    ok(input.raw().value === 'test2', 'Value not updated.');
});