(function() {
    module('Bindings');

    test('attr', function() {
        var div   = vc.dom('<div vc-attr="\'class\': className, title: title"></div>');
        var model = new (vc.Model.extend({
            className: vc.value('string', { value: 'test-class1' }),
            title: vc.value('string', { value: 'test title 1' })
        }));

        vc.app(div.raw(), model);
        ok(div.attr('class') === 'test-class1', 'Class attribute not initialised.');
        ok(div.attr('title') === 'test title 1', 'Title attribute not initialised.');

        model.className('test-class2');
        model.title('test title 2');

        ok(div.attr('class') === 'test-class2', 'Class attribute not changed.');
        ok(div.attr('title') === 'test title 2', 'Title attribute not changed.');
    });

    test('check', function() {
        var html  = vc.dom('<input type="checkbox" value="1" vc-check="bind: check">');
        var model = new (vc.Model.extend({
            check: vc.value('bool')
        }));

        vc.app(html.raw(), model);
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
        var div = vc.dom('<div vc-click="callback: test"></div>');
        var yes = false;

        vc.app(div.raw(), {
            test: function() {
                yes = true;
            }
        });

        div.fire('click');
        ok(yes, 'Click not triggered.');
    });

    test('css', function() {
        var div = vc.dom('<div class="class1" vc-css="class2: class2, class3: class3"></div>');
        var model = new (vc.Model.extend({
            class2: vc.value('bool'),
            class3: vc.value('bool')
        }));

        vc.app(div.raw(), model);

        ok(div.attr('class') === 'class1', 'Class not kept on initialisation.');
        ok(div.attr('class').split(' ').length === 1, 'Only 1 class should exist.');

        model.class2(true);
        model.class3(true);

        ok(div.attr('class').split(' ')[0] === 'class1', 'Class not kept on update.');
        ok(div.attr('class').split(' ')[1] === 'class2', 'Class not updated.');
        ok(div.attr('class').split(' ')[2] === 'class3', 'Class not updated.');
    });

    test('disable', function() {
        var input = vc.dom('<input type="text" disabled="disabled" vc-disable="test: disabled">');
        var model = new (vc.Model.extend({
            disabled: vc.value('bool')
        }));

        vc.app(input.raw(), model);

        ok(!input.raw().disabled, 'Input should be enabled.');

        model.disabled(true);

        ok(input.raw().disabled, 'Input should be disabled.');
    });

    test('each', function() {
        var dom = vc.dom('<ul><li vc-each="items: items"><span vc-content="text: text"></span></li></ul>')
        var Item = vc.Model.extend({
            text: vc.value('string')
        });

        var ctx = vc.model.make({
            items: vc.value('many', { model: Item })
        });

        vc.app(dom.raw(), ctx);

        ctx.items().append({
            text: 'Item 1'
        });

        ok(dom.raw().childNodes[0].innerText === 'Item 1', 'One item should exist as "Item 1".');

        ctx.items().append({
            text: 'Item 2'
        });

        ok(dom.raw().childNodes[1].innerText === 'Item 2', 'Two items should exist as "Item 1, Item 2".');
    });

    test('enable', function() {
        var input = vc.dom('<input type="text" vc-enable="test: enabled">');
        var model = new (vc.Model.extend({
            enabled: vc.value('bool')
        }));

        vc.app(input.raw(), model);

        ok(input.raw().disabled, 'Input should have been disabled.');

        model.enabled(true);

        ok(!input.raw().disabled, 'Input should be enabled.');
    });

    test('extend', function() {
        var html  = vc.dom('<div><div vc-extend="path: path">test</div><script id="vc-view-layout1" type="text/html"><h1 vc-content="html: $content"></h1></script><script id="vc-view-layout2" type="text/html"><h2 vc-content="html: $content"></h2></script></div>');
        var model = new (vc.Model.extend({
            path: vc.value('string', { value: 'layout1' })
        }));

        document.body.appendChild(html.raw());
        vc.app(html.raw(), model);

        ok(html.raw().childNodes[0].childNodes[0].tagName === 'H1', 'The layout was not initialised.');

        model.path('layout2');
        ok(html.raw().childNodes[0].childNodes[0].tagName === 'H2', 'The layout was not updated.');
    });

    test('focus', function() {
        var html  = vc.dom('<input type="text" vc-focus="bind: focus">');
        var focus = false;
        var model = new (vc.Model.extend({
            focus: vc.value('bool')
        }));

        vc.app(html.raw(), model);

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
    });

    test('hide', function() {
        var html  = vc.dom('<div vc-hide="test: hide"></div>');
        var model = new (vc.Model.extend({
            hide: vc.value('bool')
        }));

        vc.app(html.raw(), model);

        model.hide(true);
        ok(html.raw().style.display === 'none', 'Div should be hidden.');

        model.hide(false);
        ok(!html.raw().style.display, 'Div should be visible.');
    });

    test('html', function() {
        var div   = vc.dom('<div vc-content="html: html"></div>');
        var model = new (vc.Model.extend({
            html: vc.value('string', { value: '<ul></ul>' })
        }));

        vc.app(div.raw(), model);
        ok(div.raw().innerHTML === model.html(), 'HTML was not initialised.');

        model.html('<ol></ol>');
        ok(div.raw().innerHTML === model.html(), 'HTML was not updated.');
    });

    test('if', function() {
        var div   = vc.dom('<div><ul vc-if="test: show"></ul></div>');
        var model = new (vc.Model.extend({
            show: vc.value('bool')
        }));

        vc.app(div.raw(), model);
        ok(div.raw().childNodes[0].nodeType === 8, 'Child node should be removed.');

        model.show(true);
        ok(div.raw().childNodes[0].tagName === 'UL', 'Child node should be re-inserted.');
    });

    test('ifnot', function() {
        var div   = vc.dom('<div><ul vc-ifnot="test: show"></ul></div>');
        var model = new (vc.Model.extend({
            show: vc.value('bool')
        }));

        vc.app(div.raw(), model);
        ok(div.raw().childNodes[0].tagName === 'UL', 'Child node should be removed.');

        model.show(true);
        ok(div.raw().childNodes[0].nodeType === 8, 'Child node should be re-inserted.');
    });

    test('include', function() {
        var div   = vc.dom('<div><div vc-include="path: path"></div><script id="vc-view-child1" type="text/html">child1</script><script id="vc-view-child2" type="text/html">child2</script></div>');
        var model = new (vc.Model.extend({
            path: vc.value('string', { value: 'child1' })
        }));

        document.body.appendChild(div.raw());
        vc.app(div.raw(), model);
        ok(div.raw().childNodes[0].innerHTML === 'child1', 'Include not initialised.');

        model.path('child2');
        ok(div.raw().childNodes[0].innerHTML === 'child2', 'Include not initialised.');
    });

    test('on', function() {
        var div   = vc.dom('<div vc-on="hide: hide, show: show"></div>');
        var model = new (vc.Model.extend({
            triggered: vc.value('array'),
            hide: function(e) {
                this.triggered().push('hide');
            },
            show: function(e) {
                this.triggered().push('show');
            }
        }));

        vc.app(div.raw(), model);

        div.fire('hide');
        ok(model.triggered().indexOf('hide') !== -1, 'Event "hide" not triggered.');

        div.fire('show');
        ok(model.triggered().indexOf('show') !== -1, 'Event "show" not triggered.');
    });

    test('options', function() {
        var select = vc.dom('<select vc-options="options: options, caption: caption, text: text, value: value"></select>');
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

        vc.app(select.raw(), model);
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
        var div   = vc.dom('<div><div vc-routable="router: router"></div><script id="vc-view-test" type="text/html"><span vc-content="text: text"></span></script></div>');
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
        vc.app(div.raw(), model);

        model.router.dispatch('test1');
        ok(div.raw().childNodes[0].childNodes[0].innerText === 'test1', 'Router not initialised.');

        model.router.dispatch('test2');
        ok(div.raw().childNodes[0].childNodes[0].innerText === 'test2', 'Router not updated.');
    });

    test('show', function() {
        var html  = vc.dom('<div vc-show="test: show"></div>');
        var model = new (vc.Model.extend({
            show: vc.value('bool', { value: true })
        }));

        vc.app(html.raw(), model);

        model.show(false);
        ok(html.raw().style.display === 'none', 'Div should be hidden.');

        model.show(true);
        ok(!html.raw().style.display, 'Div should be visible.');
    });

    test('style', function() {
        var html  = vc.dom('<div vc-style="display: display, visibility: visibility"></div>');
        var model = new (vc.Model.extend({
            display: vc.value('string', { value: 'inline' }),
            visibility: function() {
                return 'hidden';
            }
        }));

        vc.app(html.raw(), model);

        ok(html.raw().style.display === 'inline', 'Display should be inline.');
        ok(html.raw().style.visibility === 'hidden', 'Display should be hidden.');
    });

    test('submit', function() {
        var form = vc.dom('<form vc-submit="callback: callback"></form>');
        var model = new (vc.Model.extend({
            submitted: vc.value('bool'),
            callback: function() {
                this.submitted(true);
            }
        }));

        vc.app(form.raw(), model);
        form.fire('submit');
        ok(model.submitted(), 'Form not submitted.');
    });

    test('text', function() {
        var div   = vc.dom('<div vc-content="text: text"></div>');
        var model = new (vc.Model.extend({
            text: vc.value('string', { value: 'test1' })
        }));

        vc.app(div.raw(), model);
        ok(div.raw().innerText === 'test1', 'Text not initialised.');

        model.text('test2');
        ok(div.raw().innerText === 'test2', 'Text not updated.');
    });

    test('value - input', function() {
        var input = vc.dom('<input type="text" vc-value="value: value">');
        var model = new (vc.Model.extend({
            value: vc.value('string', { value: 'test1' })
        }));

        vc.app(input.raw(), model);
        ok(input.raw().value === 'test1', 'Value not initialised.');

        model.value('test2');
        ok(input.raw().value === 'test2', 'Value not updated.');
    });

    test('value - select', function() {
        var select = vc.dom('<select vc-value="value: value"><option value="0"></option><option value="1"></option><option value="2"></option></select>');
        var model = vc.model.make({
            value: vc.value('int')
        });

        vc.app(select.raw(), model);
        ok(select.raw().value === '0', 'Select should initially have a 0 value.');

        model.value(1);
        ok(select.raw().value === '1', 'Select should be updated to have a 1 value.');

        select.raw().value = 2;
        select.fire('change');
        ok(model.value() === 2, 'When select is updated, model should be updated.');
    });

    test('with - model', function() {
        var div  = document.createElement('div');
        var span = document.createElement('span');

        div.setAttribute('vc-with', 'model: person');
        span.setAttribute('vc-content', 'text: name');
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

        ok(div.childNodes[0].innerText === app.person().name(), 'Inner text on div child should be initialised.');

        app.person().name('Updated Value');

        ok(div.childNodes[0].innerText === app.person().name(), 'Inner text on div child should be updated.');
    });

    test('with - controller', function() {
        var div  = document.createElement('div');
        var span = document.createElement('span');

        div.setAttribute('vc-with', 'controller: person');
        span.setAttribute('vc-content', 'text: name');
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
})();