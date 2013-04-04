velcro - MVC Binding Framework
==============================

[![Build Status](https://api.travis-ci.org/devco/velcro.png)](http://travis-ci.org/devco/velcro)

velcro gives you a complete MVC solution for building RESTful JavaScript web applications. There are no dependencies and it works with or without CommonJS / AMD libraries.

Features include:

- Full MVC separation.
- Full AMD / CommonJS support while falling back to setting the global `velcro` object.
- Complete Model / Collection and relationship management.
- View component allowing views ot be separated into their own HTML files and cached for reuse.
- Attribute bindings similar to AngularJS.
- REST Client with built-in JSON support.
- Simple and flexible routing with full support for both browser state and hashchange events.

Installation
------------

### Bower

You can install directly from Bower:

    bower install velcro.js

Or add it to your Bower `component.js` file:

    {
      "dependencies": {
        "velcro.js": "latest"
      }
    }

### Manual

Just download one of the files from the `dist/` folder, clone, or whatever and include that file somewhere in your main template file.

Using with RequireJS
--------------------

Use with RequireJS just as you would any other AMD module:

    require(['path/to/velcro'], function(velcro) {
        ...
    });

License
-------

Copyright (c) 2012 Trey Shugart

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.