seneca-async
============

Senaca using ES7 async functions

[![Travis build status](http://img.shields.io/travis/kristianmandrup/seneca-async.svg?style=flat)](https://travis-ci.org/kristianmandrup/seneca-async)[![Code Climate](https://codeclimate.com/github/kristianmandrup/seneca-async/badges/gpa.svg)](https://codeclimate.com/github/kristianmandrup/seneca-async)[![Test Coverage](https://codeclimate.com/github/kristianmandrup/seneca-async/badges/coverage.svg)](https://codeclimate.com/github/kristianmandrup/seneca-async)[![Dependency Status](https://david-dm.org/kristianmandrup/seneca-async.svg)](https://david-dm.org/kristianmandrup/seneca-async)[![devDependency Status](https://david-dm.org/kristianmandrup/seneca-async/dev-status.svg)](https://david-dm.org/kristianmandrup/seneca-async#info=devDependencies)

Development
-----------

Run `npm run lab-test` and start debugging... ;)

http://derpturkey.com/testing-asyncawait-with-babel-and-mocha/

I have taken the liberty to move most of the tests into the `temp` folder. Make the first test pass (ie. `test/common.test.js`) then move each test one at a time into `test` folder and make each one pass before moving on. When all tests pass, seneca-async should be fully functional with async/await! Welcome to the future!!!

The Seneca project uses [lab](https://www.npmjs.com/package/lab) as the test runner.

`npm run lab-test` runs the `lab-test` script as configured in `package.json`:

`"lab-test": "node --require ./babel-async lab-cli.js -v -P test"`

For the tests to work, we must use `lab` as the test runner, but using babel configured to use ES7 async functions...

If we look in `node_modules` we can see that `.bin/lab` is a simple node executable

```sh
#!/usr/bin/env node
require('../lib/cli').run();
```

We have created our own custom test runner to wrap `lab`, called: `lab-cli.js`

```js
require('lab/lib/cli').run();
```

Which can be run like this, using `--require` to activate babel with async configuration!

`node lab-cli.js -v -P test --require ./babel-async`

where `babel-async.js` contains our babel configuration that enables ES7 async functions:

```js
require('babel/register')({
  'optional': [ 'es7.asyncFunctions' ]
});
```

### Babel mocha

In the future it would be nice to rewrite a test suite using [Mocha]().

See https://github.com/bmancini55/babel-mocha-test

```js
require('babel/register')({  
  'optional': [ 'es7.asyncFunctions' ]
});
```

```json
{
  "scripts": {
    "test": "mocha --require mocha-babel"
  }
}
```
