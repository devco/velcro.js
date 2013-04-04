var _undefined;

module('Models and Collections');

test('Default Values', function() {
    var Model = Velcro.model({
        value: 'default'
    });

    var modelInstance = new Model;

    ok(modelInstance.value() === 'default', 'Default value not set.');
});

test('Defining', function() {
    var User = Velcro.model({
        name: '',
        addresses: [],
        getComputed: function() {

        }
    });

    var bob = new User({
        name: 'Bob Bobberson'
    });

    ok(Velcro.utils.isModel(User), '`Velcro.model()` should return a valid model.');
    ok(Velcro.utils.isObservable(bob.name), 'The property should be an observable.');
    ok(Velcro.utils.isObservable(bob.computed), 'The property should be a computed observable.');
});

test('Instantiating', function() {
    var User = Velcro.model({
        name: ''
    });

    var instance = new User({
        name: 'test',
        undefinedProperty: 'test'
    });

    ok(instance instanceof User, 'The `user` instance should be an instance of the `User` model.');
    ok(Velcro.utils.isObservable(instance.observer), 'The `observer` property should be a Knockout observable.');
    ok(instance.name() === 'test', 'The instance should be filled when data is passed to the constructor.');
    ok(typeof instance.undefinedProperty === 'undefined', 'Undefined properties should not be set.');
});

test('Relationships', function() {
    var Friend = Velcro.model({
        name: ''
    });

    var User = Velcro.model({
        bestFriend: Friend,
        friends: Friend.Collection
    });

    var user = new User();

    user.bestFriend({
        name: 'Dog'
    });

    user.friends([
        { name: 'Cat' },
        { name: 'Lizard' }
    ]);

    var exported = user.raw();

    ok(exported.bestFriend.name === user.bestFriend().name(), 'Dog should be the best friend.');
    ok(exported.friends[0].name === user.friends().first().name(), 'Cat should be 2nd best.');
    ok(exported.friends[1].name === user.friends().at(1).name(), 'Lizard should be 3rd best.');
});

test('Collection Manipulation', function() {
    var Item = Velcro.model({
        name: ''
    });

    var Items = Velcro.model({
        items: Item.Collection
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
    var User = Velcro.model({
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
    var exported = user.raw();

    ok(exported.name === user.name(), 'The `name` reader should have been exported.');
});

test('Parent / Child Relationships', function() {
    var NoParentModel = Velcro.model({
        name: ''
    });

    var ChildModel = Velcro.model({
        name: ''
    });

    var ParentModel = Velcro.model({
        child: ChildModel,
        children: ChildModel.Collection
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
    var Model = Velcro.model({
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



module('Application / Binding Engine');

test('Observing Changes', function() {
    var div  = document.createElement('div');
    var span = document.createElement('span');

    span.setAttribute('data-velcro-text', 'text: name');
    div.appendChild(span);

    var Person = Velcro.model({
        name: 'Default Value'
    });

    var dude = new Person;

    new Velcro.App().bind(div, dude);

    ok(div.childNodes[0].innerText === dude.name(), 'Inner text on div child should be initialised.');

    dude.name('Updated Value');

    ok(div.childNodes[0].innerText === dude.name(), 'Inner text on div child should be updated.');
});

test('Changing Context', function() {
    var div  = document.createElement('div');
    var span = document.createElement('span');

    div.setAttribute('data-velcro-context', 'context: person');
    span.setAttribute('data-velcro-text', 'text: name');
    div.appendChild(span);

    var App = Velcro.model({
        person: Velcro.model({
            name: 'Default Value'
        })
    });

    var appsrawesome = new App;

    new Velcro.App().bind(div, appsrawesome)
    ok(div.childNodes[0].innerText === appsrawesome.person().name(), 'Inner text on div child should be initialised.');

    appsrawesome.person().name('Updated Value');

    ok(div.childNodes[0].innerText === appsrawesome.person().name(), 'Inner text on div child should be updated.');
});

asyncTest('Router', function() {
    var div = document.createElement('div');
    div.setAttribute('data-velcro-routable', 'router: router');

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
    div.setAttribute('data-velcro-include', 'path: "index", context: context, callback: callback');

    new Velcro.App().bind(div, {
        context: function () {
            return { name: 'test' };
        },
        callback: function() {
            ok(div.childNodes[0].innerHTML === 'test', 'Inner text on div\'s child span should initialise.');
            start();
        }
    });
});



module('Views');

test('No Model Binding', function() {
    var view = new Velcro.View();

    view.target = document.createElement('div');
    view.cache.test = 'test';

    view.render('test');

    ok(view.target.innerHTML === 'test', 'The view should render without a bound model.');
});



module('Http');

asyncTest('Parsing Based on Request Header', function() {
    var http = new Velcro.Http();

    http.headers.Accept = 'application/json';

    http.get({
        url: 'data/bob.json',
        success: function(r) {
            ok(r.name === 'Bob Bobberson', 'JSON object should be properly parsed.');
            start();
        }
    });
});