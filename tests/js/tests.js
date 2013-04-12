var _undefined;



module('Utils');

test('Object Merging', function() {
    var merged = Velcro.utils.merge({
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
    var MyObj1 = Velcro.Class.extend({
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

    ok(Velcro.Model.isSubClassOf(Velcro.Class), 'Velcro.Model should be a subclass of Velcro.Class.');
    ok(MyObj1.isSubClassOf(Velcro.Model), 'MyObj1 should be a subclass of Velcro.Model.');
    ok(MyObj2.isSubClassOf(MyObj1), 'MyObj2 should be a subclass of MyObj1.');
    ok(MyObj3.isSubClassOf(Velcro.Class), 'MyObj3 should be a subclass of Velcro.Class.');
    ok(obj3 instanceof MyObj1, 'Should be instance of 1st object.');
    ok(obj3 instanceof MyObj2, 'Should be instance of 2nd object.');
    ok(obj3 instanceof MyObj3, 'Should be instance of 3rd object.');
    ok(obj3.method1() === 'test1', 'Inherited method not working.');
    ok(obj3.method2() === 'test2', 'Overridden method not working.');
    ok(obj3.method3() === 'test3', 'Third level method not working.');
});



module('Models and Collections');

test('Default Values', function() {
    var Model = Velcro.Model.extend({
        value: 'default'
    });

    var modelInstance = new Model;

    ok(modelInstance.value() === 'default', 'Default value not set.');
});

test('Defining', function() {
    var User = Velcro.Model.extend({
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

    ok(Velcro.utils.isValue(bob1.forename), 'The forename property should be an observable.');
    ok(Velcro.utils.isValue(bob1.surname), 'The surname property should be an observable.');
    ok(Velcro.utils.isValue(bob1.name), 'The name property should be a computed observable.');

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
    var Friend = Velcro.Model.extend({
        name: ''
    });

    var User = Velcro.Model.extend({
        bestFriend: Friend,
        friends: Velcro.Collection.make(Friend)
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
    var Item = Velcro.Model.extend({
        name: ''
    });

    var Items = Velcro.Model.extend({
        items: Velcro.Collection.make(Item)
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
    var User = Velcro.Model.extend({
        forename: '',
        surname: '',
        getName: function() {
            return this.forename() + ' ' + this.surname();
        },
        setName: function(name) {
            name = name.split(' ');
            this.forename(name[0]);
            this.surname(name[1]);
            return this;
        }
    });

    var user     = new User().name('Barbara Barberson');
    var exported = user.to();

    ok(exported.name === user.name(), 'The `name` reader should have been exported.');
});

test('Parent / Child Relationships', function() {
    var NoParentModel = Velcro.Model.extend({
        name: ''
    });

    var ChildModel = Velcro.Model.extend({
        name: ''
    });

    var ParentModel = Velcro.Model.extend({
        child: ChildModel,
        children: Velcro.Collection.make(ChildModel)
    });

    var owner = new ParentModel({
        child: {
            name: 'test'
        },
        children: [{
            name: 'test'
        }]
    });

    ok(owner.child().$parent instanceof ParentModel, 'The child model\'s $parent should be an instanceof ParentModel.');
    ok(owner.children().at(0).$parent instanceof ParentModel, 'The children collection\'s $parent should be an instanceof ParentModel.');
});

test('Chaining Method Calls', function() {
    var Model = Velcro.Model.extend({
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



module('Views');

test('No Model Binding', function() {
    var view = new Velcro.View();

    view.options.target = document.createElement('div');
    view.cache.test     = 'test';

    view.render('test');

    ok(view.options.target.innerHTML === 'test', 'The view should render without a bound model.');
});



module('Http');

asyncTest('Parsing Based on Request Header', function() {
    var http = new Velcro.Http({
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

    span.setAttribute('data-vc-text', 'text: name');
    div.appendChild(span);

    var Person = Velcro.Model.extend({
        name: 'Default Value'
    });

    var dude = new Person;

    new Velcro.App().bind(div, dude);

    ok(div.childNodes[0].innerText === dude.name(), 'Inner text on div child should be initialised.');

    dude.name('Updated Value');

    ok(div.childNodes[0].innerText === dude.name(), 'Inner text on div child should be updated.');
});

asyncTest('Router', function() {
    var div = document.createElement('div');
    div.setAttribute('data-vc-routable', 'router: router');

    var app    = new Velcro.App()
    var router = new Velcro.Router();

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

    new Velcro.App().bind(div, {
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

    try {
        new Velcro.App().bind({
            test: true,
            items: [
                'Item 1',
                'Item 2'
            ]
        });
        ok(true);
    } catch (e) {
        ok(false, e.toString());
    }
});



module('Bindings');

test('context', function() {
    var div  = document.createElement('div');
    var span = document.createElement('span');

    div.setAttribute('data-vc-context', 'context: person');
    span.setAttribute('data-vc-text', 'text: name');
    div.appendChild(span);

    var App = Velcro.Model.extend({
        person: Velcro.Model.extend({
            name: 'Default Value'
        })
    });

    var appsrawesome = new App;

    new Velcro.App().bind(div, appsrawesome)
    ok(div.childNodes[0].innerText === appsrawesome.person().name(), 'Inner text on div child should be initialised.');

    appsrawesome.person().name('Updated Value');

    ok(div.childNodes[0].innerText === appsrawesome.person().name(), 'Inner text on div child should be updated.');
});

test('each', function() {
    var ul    = document.createElement('ul');
    var li    = document.createElement('li');
    var Items = Velcro.Collection.make(Velcro.Model.extend({
        text: ''
    }));

    ul.appendChild(li);
    li.setAttribute('data-vc-each', 'items: items');
    li.setAttribute('data-vc-text', 'text: text');

    var ctx = { items: new Items() };
    var app = new Velcro.App().bind(ul, ctx);

    ctx.items.append({
        text: 'Item 1'
    });

    ok(ul.childNodes.length === 1 && ul.childNodes[0].innerText === 'Item 1', 'One item should exist as "Item 1".');

    ctx.items.append({
        text: 'Item 2'
    });

    ok(ul.childNodes.length === 2 && ul.childNodes[1].innerText === 'Item 2', 'Two items should exist as "Item 1, Item 2".');
});