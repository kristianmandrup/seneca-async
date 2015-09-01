var make        = require('../make');
var paramcheck  = make.make_paramcheck()
var utils       = require('../utils')
var thrower     = utils.thrower
var pin_patrun_customizer = utils.pin_patrun_customizer
var patrun      = require('patrun')

module.exports = function(private$, initial_options) {
  var so = private$.optioner.set( initial_options )
  paramcheck.options.validate(so, thrower)

  // These need to come from options as required during construction.
  so.internal.actrouter    = so.internal.actrouter    || patrun()
  so.internal.clientrouter = so.internal.clientrouter || patrun(pin_patrun_customizer)
  so.internal.subrouter    = so.internal.subrouter    || patrun(pin_patrun_customizer)
  return so;
}
