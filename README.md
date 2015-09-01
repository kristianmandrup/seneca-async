seneca-async
============

Senaca using ES7 async functions

[![Travis build status](http://img.shields.io/travis/kristianmandrup/seneca-async.svg?style=flat)](https://travis-ci.org/kristianmandrup/seneca-async)[![Code Climate](https://codeclimate.com/github/kristianmandrup/seneca-async/badges/gpa.svg)](https://codeclimate.com/github/kristianmandrup/seneca-async)[![Test Coverage](https://codeclimate.com/github/kristianmandrup/seneca-async/badges/coverage.svg)](https://codeclimate.com/github/kristianmandrup/seneca-async)[![Dependency Status](https://david-dm.org/kristianmandrup/seneca-async.svg)](https://david-dm.org/kristianmandrup/seneca-async)[![devDependency Status](https://david-dm.org/kristianmandrup/seneca-async/dev-status.svg)](https://david-dm.org/kristianmandrup/seneca-async#info=devDependencies)

Development
-----------

Run `npm test` and start debugging... ;)

http://derpturkey.com/testing-asyncawait-with-babel-and-mocha/

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
