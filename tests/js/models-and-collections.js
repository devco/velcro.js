(function() {
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
        var html = vc.dom('<div vc-content="text: name"></div>');

        vc.app(html, user);
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
})();