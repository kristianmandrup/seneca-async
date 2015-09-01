var util   = require('util');
var events = require('events');

// ### Declarations

// Seneca is an EventEmitter.
function Seneca() {
  events.EventEmitter.call(this)
  this.setMaxListeners(0)
}
util.inherits(Seneca, events.EventEmitter)

module.exports = Seneca;
