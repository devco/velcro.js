var _undefined;



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



module('Models and Collections');

test('Simple Values', function() {
    var Model = vc.Model.extend({
        value1: vc.value('string'),
        value2: vc.value('string', { value: 'default' })
    });

    var model1 = new Model;
    var model2 = new Model;

    model1.value1('updated1');
    model2.value1('updated2');

    ok(model1.value1() === 'updated1', 'Update 1 value not set.');
    ok(model1.value2() === 'default', 'Model 1 default not set.');
    ok(model2.value1() === 'updated2', 'Updated 2 value not set.');
    ok(model2.value2() === 'default', 'Model 2 default not set.');
});

test('Defining', function() {
    var User = vc.Model.extend({
        forename: vc.value('string'),
        surname: vc.value('string'),
        name: vc.value('computed', {
            use: ['forename', 'surname'],
            read: function() {
                return this.forename() + ' ' + this.surname();
            },
            write: function(name) {
                var names = name.split(' ');
                this.forename(names[0]);
                this.surname(names[1]);
            }
        })
    });

    var bob1 = new User({
        name: 'Bob Bobberson'
    });

    var bob2 = new User({
        name: 'Bob Bobberson'
    });

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
    var Friend = vc.Model.extend({
        name: vc.value('string')
    });

    var User = vc.Model.extend({
        bestFriend: vc.value('one', { model: Friend }),
        friends: vc.value('many', { model: Friend })
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
    var Item = vc.Model.extend({
        name: vc.value('string')
    });

    var Items = vc.Model.extend({
        items: vc.value('many', { model: Item })
    });

    var model = new Items();

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
    var Getter = vc.Model.extend({
        _prop: vc.value('bool', { value: true }),
        prop: vc.value('computed', {
            read: function() {
                return this._prop();
            }
        })
    });

    var Setter = vc.Model.extend({
        _prop: vc.value('bool'),
        prop: vc.value('computed', {
            write: function(prop) {
                this._prop(prop);
            }
        })
    });

    var GetterAndSetter = vc.Model.extend({
        _prop: vc.value('bool'),
        prop: vc.value('computed', {
            read: function() {
                return this._prop();
            },
            write: function(prop) {
                this._prop(prop);
            }
        })
    });

    var User = vc.Model.extend({
        forename: vc.value('string', 'Bob'),
        surname: vc.value('string', 'Bobberson'),
        name: vc.value('computed', {
            use: ['forename', 'surname'],
            read: function() {
                return [this.forename(), this.surname()].join(' ').replace(/\s+$/, '');
            }
        })
    });

    var model = new Getter();
    ok(model.prop(), 'Getter without setter not working.');

    var model = new Setter();
    model.prop(true);

    ok(model._prop(), 'Setter without getter not working.');

    var model = new GetterAndSetter();
    model.prop(true);
    ok(model.prop(), 'Getter and setter not working.');

    var user = new User({ forename: 'Bob' });
    var html = vc.dom('<div data-vc-contents="text: name"></div>');
    var app  = vc.app(html, user);

    ok(html.contents() === 'Bob', 'Not initialised.');

    user.forename('Marge');
    ok(html.contents() === 'Marge', 'Not updated.');
});

test('Parent / Child Relationships', function() {
    var LeafModel = vc.Model.extend({
        test: function() {
            ok(this instanceof LeafModel, 'Using `this` in a method should refer to current model.');
            ok(this.parent() instanceof BranchModel, 'Using `this.parent()` in a method should refer to the correct parent.');
            ok(this.parent().parent() instanceof TrunkModel, 'Correct ancestor not found.');
        }
    });

    var BranchModel = vc.Model.extend({
        leaf: vc.value('one', { model: LeafModel }),
        leafs: vc.value('many', { model: LeafModel })
    });

    var TrunkModel = vc.Model.extend({
        leaf: vc.value('one', { model: LeafModel }),
        leafs: vc.value('many', { model: LeafModel }),
        branch: vc.value('one', { model: BranchModel }),
        branches: vc.value('many', { model: BranchModel })
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
    var Model = vc.Model.extend({
        test1: vc.value('string'),
        test3: vc.value('string'),
        test2: vc.value('computed', {
            read: function() {
                return this.test3();
            },
            write: function(value) {
                this.test3(value);
            }
        })
    });

    var test = new Model;

    ok(test.test1('test') instanceof Model, 'Observable property is not chainable.');
    ok(test.test2('test') instanceof Model, 'Observable setter is not chainable.');
});

test('Rebinding Methods to Model Instance', function() {
    var Model = vc.Model.extend({
        test: function() {
            ok(this instanceof Model, 'Using `this` inside of a model method should refer to the model instance in which it is defined.');
            return this;
        }
    });

    var model = new Model;
    ok(model.test() instanceof Model, 'Instance should be returned.');
});



module('Views');

test('No Model Binding', function() {
    var view = new vc.View();

    view.options.target = document.createElement('div');
    view.cache.test     = 'test';

    view.render('test');

    ok(view.options.target.innerHTML === 'test', 'The view should render without a bound model.');
});



module('Http');

asyncTest('Parsing Based on Request Header', function() {
    var http = new vc.Http({
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

    var Person = vc.Model.extend({
        name: vc.value('string', { value: 'Default Value' })
    });

    var dude = new Person;

    new vc.App().bind(div, dude);

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
    div.setAttribute('data-vc-routable', 'router: router');

    var app    = new vc.App()
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

    app.bind(div, {
        router: router
    });

    router.go('index');
});

asyncTest('View', function() {
    var div = document.createElement('div');
    div.setAttribute('data-vc-include', 'path: "index", context: context, callback: callback');

    new vc.App().bind(div, {
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

    new vc.App().bind({
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
    var div   = vc.dom('<div data-vc-attr="\'class\': className, title: title"></div>');
    var app   = new vc.App;
    var model = new (vc.Model.extend({
        className: vc.value('string', { value: 'test-class1' }),
        title: vc.value('string', { value: 'test title 1' })
    }));

    app.bind(div.raw(), model);

    ok(div.attr('class') === 'test-class1', 'Class attribute not initialised.');
    ok(div.attr('title') === 'test title 1', 'Title attribute not initialised.');

    model.className('test-class2');
    model.title('test title 2');

    ok(div.attr('class') === 'test-class2', 'Class attribute not changed.');
    ok(div.attr('title') === 'test title 2', 'Title attribute not changed.');
});

test('check', function() {
    var html  = vc.dom('<input type="checkbox" value="1" data-vc-check="bind: check">');
    var app   = new vc.App;
    var model = new (vc.Model.extend({
        check: vc.value('bool')
    }));

    app.bind(html.raw(), model);
    ok(!html.raw().checked, 'Checkbox should not be checked.');

    model.check(true);
    ok(html.raw().checked, 'Checkbox should be checked.');

    html.raw().checked = false;
    html.fire('change');
    ok(!model.check(), 'Model should not be checked.');

    html.raw().checked = true;
    html.fire('change');
    ok(model.check(), 'Model should be checked.');
});

test('click', function() {
    var div = vc.dom('<div data-vc-click="callback: test"></div>');
    var app = new vc.App;
    var yes = false;

    app.bind(div.raw(), {
        test: function() {
            yes = true;
        }
    });

    div.fire('click');
    ok(yes, 'Click not triggered.');
});

test('css', function() {
    var div   = vc.dom('<div data-vc-css="class1: class1, class2: class2"></div>');
    var app   = new vc.App;
    var model = new (vc.Model.extend({
        class1: vc.value('string', { value: 'test-class1' }),
        class2: vc.value('string', { value: 'test-class2' })
    }));

    app.bind(div.raw(), model);

    ok(div.attr('class').split(' ')[0] === model.class1(), 'Class not initialised.');
    ok(div.attr('class').split(' ')[1] === model.class2(), 'Class not initialised.');

    model.class1('test-class1-updated');
    model.class2('test-class2-updated');

    ok(div.attr('class').split(' ')[0] === model.class1(), 'Class not updated.');
    ok(div.attr('class').split(' ')[1] === model.class2(), 'Class not updated.');
});

test('disable', function() {
    var input = vc.dom('<input type="text" disabled="disabled" data-vc-disable="test: disabled">');
    var app   = new vc.App;
    var model = new (vc.Model.extend({
        disabled: vc.value('bool')
    }));

    app.bind(input.raw(), model);

    ok(!input.raw().disabled, 'Input should be enabled.');

    model.disabled(true);

    ok(input.raw().disabled, 'Input should be disabled.');
});

test('each', function() {
    var ul   = document.createElement('ul');
    var li   = document.createElement('li');
    var Item = vc.Model.extend({
        text: vc.value('string')
    });

    ul.appendChild(li);
    li.setAttribute('data-vc-each', 'items: items');
    li.setAttribute('data-vc-contents', 'text: text');

    var ctx = new (vc.Model.extend({
        items: vc.value('many', { model: Item })
    }));

    var app = new vc.App().bind(ul, ctx);

    ctx.items().append({
        text: 'Item 1'
    });

    ok(ul.childNodes[0].innerText === 'Item 1', 'One item should exist as "Item 1".');

    ctx.items().append({
        text: 'Item 2'
    });

    ok(ul.childNodes[1].innerText === 'Item 2', 'Two items should exist as "Item 1, Item 2".');
});

test('enable', function() {
    var input = vc.dom('<input type="text" data-vc-enable="test: enabled">');
    var app   = new vc.App;
    var model = new (vc.Model.extend({
        enabled: vc.value('bool')
    }));

    app.bind(input.raw(), model);

    ok(input.raw().disabled, 'Input should have been disabled.');

    model.enabled(true);

    ok(!input.raw().disabled, 'Input should be enabled.');
});

test('extend', function() {
    var html  = vc.dom('<div><div data-vc-extend="path: path">test</div><script id="vc-view-layout1" type="text/html"><h1 data-vc-contents="html: $content"></h1></script><script id="vc-view-layout2" type="text/html"><h2 data-vc-contents="html: $content"></h2></script></div>');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        path: vc.value('string', { value: 'layout1' })
    }));

    document.body.appendChild(html.raw());
    app.bind(html.raw(), model);

    ok(html.raw().childNodes[0].childNodes[0].tagName === 'H1', 'The layout was not initialised.');

    model.path('layout2');
    ok(html.raw().childNodes[0].childNodes[0].tagName === 'H2', 'The layout was not updated.');
});

test('focus', function() {
    var html  = vc.dom('<input type="text" data-vc-focus="bind: focus">');
    var focus = false;
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        focus: vc.value('bool')
    }));

    app.bind(html.raw(), model);

    html.on('focus', function() {
        focus = true;
    }).on('blur', function() {
        focus = false;
    });

    html.raw().focus();
    html.fire('focus');
    ok(model.focus(), 'Model not changed when element focused.');

    html.raw().blur();
    html.fire('blur');
    ok(!model.focus(), 'Model not changed when element blurred.');

    model.focus(true);
    ok(focus, 'Element not focused when model changed.');

    model.focus(false);
    ok(!focus, 'Element not blurred when model changed.');
});

test('hide', function() {
    var html  = vc.dom('<div data-vc-hide="test: hide"></div>');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        hide: vc.value('bool')
    }));

    app.bind(html.raw(), model);

    model.hide(true);
    ok(html.raw().style.display === 'none', 'Div should be hidden.');

    model.hide(false);
    ok(!html.raw().style.display, 'Div should be visible.');
});

test('html', function() {
    var div   = vc.dom('<div data-vc-contents="html: html"></div>');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        html: vc.value('string', { value: '<ul></ul>' })
    }));

    app.bind(div.raw(), model);
    ok(div.raw().innerHTML === model.html(), 'HTML was not initialised.');

    model.html('<ol></ol>');
    ok(div.raw().innerHTML === model.html(), 'HTML was not updated.');
});

test('if', function() {
    var div   = vc.dom('<div><ul data-vc-if="test: show"></ul></div>');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        show: vc.value('bool')
    }));

    app.bind(div.raw(), model);
    ok(div.raw().childNodes[0].style.display = 'none');

    model.show(true);
    ok(div.raw().childNodes[0].style.display = 'block');
});

test('include', function() {
    var div   = vc.dom('<div><div data-vc-include="path: path"></div><script id="vc-view-child1" type="text/html">child1</script><script id="vc-view-child2" type="text/html">child2</script></div>');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        path: vc.value('string', { value: 'child1' })
    }));

    document.body.appendChild(div.raw());
    app.bind(div.raw(), model);
    ok(div.raw().childNodes[0].innerHTML === 'child1', 'Include not initialised.');

    model.path('child2');
    ok(div.raw().childNodes[0].innerHTML === 'child2', 'Include not initialised.');
});

test('on', function() {
    var div   = vc.dom('<div data-vc-on="hide: hide, show: show"></div>');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        triggered: vc.value('array'),
        hide: function(e) {
            this.triggered().push('hide');
        },
        show: function(e) {
            this.triggered().push('show');
        }
    }));

    app.bind(div.raw(), model);

    div.fire('hide');
    ok(model.triggered().indexOf('hide') !== -1, 'Event "hide" not triggered.');

    div.fire('show');
    ok(model.triggered().indexOf('show') !== -1, 'Event "show" not triggered.');
});

test('options', function() {
    var select = vc.dom('<select data-vc-options="options: options, caption: caption, text: text, value: value"></select>');
    var app    = new vc.App();
    var model  = new (vc.Model.extend({
        caption: vc.value('string', { value: 'Choose...' }),
        options: vc.value('many', {
            model: vc.Model.extend({
                text: vc.value('string'),
                value: vc.value('string')
            })
        }),
        text: function(option) {
            return option.text();
        },
        value: vc.value('string', { value: 'value' })
    }));

    app.bind(select.raw(), model);
    ok(select.raw().childNodes.length === 1, 'Only the caption should be visible.');

    model.options([{
        text: 'Option 1',
        value: 0
    }, {
        text: 'Option 2',
        value: 1
    }]);

    ok(select.raw().childNodes[1].innerText === 'Option 1', 'Option 1 text not updated.');
    ok(select.raw().childNodes[1].value === '0', 'Option 1 value not updated.');
    ok(select.raw().childNodes[2].innerText === 'Option 2', 'Option 2 text not updated.');
    ok(select.raw().childNodes[2].value === '1', 'Option 2 value not updated.');
});

test('routable', function() {
    var div   = vc.dom('<div><div data-vc-routable="router: router"></div><script id="vc-view-test" type="text/html"><span data-vc-contents="text: text"></span></script></div>');
    var app   = new vc.App();
    var model = {
        router: new vc.Router()
    };

    model.router.set('test1', {
        view: 'test',
        controller: function() {
            return {
                text: 'test1'
            }
        }
    });

    model.router.set('test2', {
        view: 'test',
        controller: function() {
            return {
                text: 'test2'
            }
        }
    });

    document.body.appendChild(div.raw());
    app.bind(div.raw(), model);

    model.router.dispatch('test1');
    ok(div.raw().childNodes[0].childNodes[0].innerText === 'test1', 'Router not initialised.');

    model.router.dispatch('test2');
    ok(div.raw().childNodes[0].childNodes[0].innerText === 'test2', 'Router not updated.');
});

test('show', function() {
    var html  = vc.dom('<div data-vc-show="test: show"></div>');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        show: vc.value('bool', { value: true })
    }));

    app.bind(html.raw(), model);

    model.show(false);
    ok(html.raw().style.display === 'none', 'Div should be hidden.');

    model.show(true);
    ok(!html.raw().style.display, 'Div should be visible.');
});

test('style', function() {
    var html  = vc.dom('<div data-vc-style="display: display, visibility: visibility"></div>');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        display: vc.value('string', { value: 'inline' }),
        visibility: function() {
            return 'hidden';
        }
    }));

    app.bind(html.raw(), model);

    ok(html.raw().style.display === 'inline', 'Display should be inline.');
    ok(html.raw().style.visibility === 'hidden', 'Display should be hidden.');
});

test('submit', function() {
    var form = vc.dom('<form data-vc-submit="callback: callback"></form>');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        submitted: vc.value('bool'),
        callback: function() {
            this.submitted(true);
        }
    }));

    app.bind(form.raw(), model);
    form.fire('submit');
    ok(model.submitted(), 'Form not submitted.');
});

test('text', function() {
    var div   = vc.dom('<div data-vc-contents="text: text"></div>');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        text: vc.value('string', { value: 'test1' })
    }));

    app.bind(div.raw(), model);
    ok(div.raw().innerText === 'test1', 'Text not initialised.');

    model.text('test2');
    ok(div.raw().innerText === 'test2', 'Text not updated.');
});

test('value', function() {
    var input = vc.dom('<input type="text" data-vc-value="value: value">');
    var app   = new vc.App();
    var model = new (vc.Model.extend({
        value: vc.value('string', { value: 'test1' })
    }));

    app.bind(input.raw(), model);
    ok(input.raw().value === 'test1', 'Value not initialised.');

    model.value('test2');
    ok(input.raw().value === 'test2', 'Value not updated.');
});

test('with - model', function() {
    var div  = document.createElement('div');
    var span = document.createElement('span');

    div.setAttribute('data-vc-with', 'model: person');
    span.setAttribute('data-vc-contents', 'text: name');
    div.appendChild(span);

    var App = vc.model({
        person: vc.value('one', {
            model: vc.model({
                name: vc.value('string', { value: 'Default Value' })
            })
        })
    });

    var app = new App;

    vc.app(div, app);

    ok(div.childNodes[0].innerText === appsrawesome.person().name(), 'Inner text on div child should be initialised.');

    app.person().name('Updated Value');

    ok(div.childNodes[0].innerText === appsrawesome.person().name(), 'Inner text on div child should be updated.');
});

test('with - controller', function() {
    var div  = document.createElement('div');
    var span = document.createElement('span');

    div.setAttribute('data-vc-with', 'controller: person');
    span.setAttribute('data-vc-contents', 'text: name');
    div.appendChild(span);

    vc.app(div, {
        person: function() {
            return vc.model.make({
                name: vc.value('string', { value: 'test' })
            });
        }
    });

    ok(div.childNodes[0].innerText === 'test', 'Inner text on div child should be initialised.');
});