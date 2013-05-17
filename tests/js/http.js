(function() {
    module('Http');

    asyncTest('Parsing Based on Request Header', function() {
        var http = new vc.Http({
            headers: {
                Accept: 'application/json'
            }
        });

        http.get({ url: 'data/bob.json' })
            .then(function(json) {
                ok(json.name === 'Bob Bobberson', 'JSON object should be properly parsed.');
            }, function(reason) {
                ok(false, reason);
            })
            .then(start, start);
    });

    asyncTest('Deferring', function() {
        var http = new vc.Http({
            prefix: 'data/',
            suffix: '.json',
            headers: {
                Accept: 'application/json'
            }
        });

        var getPerson = http.defer('GET :name', {
            name: 'jane'
        });

        getPerson({
            name: 'bob'
        }).then(function(bob) {
            ok(bob.name === 'Bob Bobberson', 'Bob not returned.');
        }, function(reason) {
            ok(false, reason);
        }).then(start, start);
    });
})();