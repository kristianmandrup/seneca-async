var make_optioner = require('../../make').make_optioner;

// TODO: bind this
module.exports = function(private$) {
  // Create option resolver.
  private$.optioner = make_optioner(
    argv,
    initial_options.module || module.parent || module,
    DEFAULT_OPTIONS
  )
}
