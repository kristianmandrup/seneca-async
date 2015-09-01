var make_optioner = require('../../make').make_optioner;
var  DEFAULT_OPTIONS = require('./default-options')
var cmdline = require('../../lib/cmdline');

// TODO: bind this
module.exports = function(root, private$, initial_options) {
  var argv       = cmdline(root)

  // Create option resolver.
  private$.optioner = make_optioner(
    argv,
    initial_options.module || module.parent || module,
    DEFAULT_OPTIONS
  )
}
