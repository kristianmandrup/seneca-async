var make       = require('../make');
var paramcheck = make.make_paramcheck()

module.exports = function(private$, initial_options)
  private$.optioner.set( initial_options )
  paramcheck.options.validate(so, thrower)

  // These need to come from options as required during construction.
  so.internal.actrouter    = so.internal.actrouter    || patrun()
  so.internal.clientrouter = so.internal.clientrouter || patrun(pin_patrun_customizer)
  so.internal.subrouter    = so.internal.subrouter    || patrun(pin_patrun_customizer)
  return so;
}
