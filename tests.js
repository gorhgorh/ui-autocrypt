Tests = function() {
    var env = {specs: {}, prefix: ''};
    var assertions = 0;
    var failures = 0;

    function log(message) {
        console.log( '%c ' + message, 'color: #444');
    }

    function fail(message) {
        console.log( '%c ' + message, 'color: red');
    }

    function assert(truth, message) {
        assertions = assertions + 1;
        if (!truth) {
            failures = failures + 1;
            fail("   " + message);
        }
    };

    assert.content = function(text, id) {
        elem = document.getElementById(id);
        assert( elem.innerText == text,
                id + ' should contain "' + text + '".' );
    };

    assert.selector = function(selector) {
        elem = document.querySelector(selector);
        assert( elem,
                'Expected to find element matching "' + selector + '".' );
    };

    async function run() {
        var arr = Object.entries(this.specs)
        var setup = this.setup;
        var teardown = this.teardown;
        var prefix = this.prefix;
        if (arr.length == 0) return;
        for (let suite of arr) {
            var name = suite[0];
            var desc = suite[1];
            var env = {specs: {}, prefix: prefix + '  '};
            log(prefix + name);
            if (setup) setup();
            // run the described test if there is one
            await desc.bind(env)(describe.bind(env), assert);
            // recurse
            await run.bind(env)();
            if (teardown) teardown();
        };
        return (assertions + ' assertions. ' + failures + ' failures.');
    };

    function describe(context, fun) {
        this.specs[context] = fun
    };

    async function runTests() {
        assertions = 0;
        failures = 0;
        console.log(await run.bind(env)());
    };

    return {
        describe: describe.bind(env),
        run: runTests
    };
}();

