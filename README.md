seneca-async
============

Senaca using ES7 async functions

[![Travis build status](http://img.shields.io/travis/kristianmandrup/seneca-async.svg?style=flat)](https://travis-ci.org/kristianmandrup/seneca-async)[![Code Climate](https://codeclimate.com/github/kristianmandrup/seneca-async/badges/gpa.svg)](https://codeclimate.com/github/kristianmandrup/seneca-async)[![Test Coverage](https://codeclimate.com/github/kristianmandrup/seneca-async/badges/coverage.svg)](https://codeclimate.com/github/kristianmandrup/seneca-async)[![Dependency Status](https://david-dm.org/kristianmandrup/seneca-async.svg)](https://david-dm.org/kristianmandrup/seneca-async)[![devDependency Status](https://david-dm.org/kristianmandrup/seneca-async/dev-status.svg)](https://david-dm.org/kristianmandrup/seneca-async#info=devDependencies)

Development
-----------

Run `npm test` and start debugging... ;)

http://derpturkey.com/testing-asyncawait-with-babel-and-mocha/

At this point I have taken the liberty to move most of the tests into the `temp` folder. Make the first test pass (ie. `test/common.test.js`) then move each test one at a time into `test` folder and make each one pass before moving on. When all tests pass, seneca-async should be fully functional with async/await! Welcome to the future!!!

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

Looks like npm test uses the npm `"main"` entry to see where to pick up the tests? If I change it to point to `dist/seneca.js`. If I change it to `"main": "src/seneca.js"` it seems to work. Please feel free to fix this using a better way! The `"main"` entry is also used for exporting the compiled distribution file on inclusion of the package!

```sh
Error: Cannot find module './seneca/init'
    at Function.Module._resolveFilename (module.js:336:15)
    at Function.Module._load (module.js:286:25)
    at Module.require (module.js:365:17)
    at require (module.js:384:17)
    at /Users/kristianmandrup/repos/test123/senaca-projects/seneca-async/dist/seneca.js:18:13
```
