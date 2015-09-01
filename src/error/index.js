var ERRMSGMAP = require('./msg-map');
var eraro  = require('eraro');

module.exports = error = eraro({
  package:  'seneca',
  msgmap:   ERRMSGMAP(),
  override: true
})
