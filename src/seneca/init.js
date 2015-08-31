// Primary export function, creates a new Seneca instance.
module.exports = function init( seneca_options, more_options ) {

  // Create instance.
  var seneca = make_seneca( _.extend( {}, seneca_options, more_options ))
  var so     = seneca.options()

  // Register default plugins, unless turned off by options.
  if( so.default_plugins.basic )        { seneca.use('basic') }
  if( so.default_plugins.transport )    { seneca.use('transport') }
  if( so.default_plugins.web )          { seneca.use('web') }
  if( so.default_plugins['mem-store'] ) { seneca.use('mem-store') }

  // Register plugins specified in options.
  _.each(so.plugins, function(plugindesc) {
    seneca.use(plugindesc)
  })

  return seneca
}



// To reference builtin loggers when defining logging options.
init.loghandler = logging.handlers


// Makes require('seneca').use( ... ) work by creating an on-the-fly instance.
init.use = function() {
  var instance = init()
  return instance.use.apply(instance,arr(arguments))
}

// Mostly for testing.
if( require.main === module ) {
  init()
}
