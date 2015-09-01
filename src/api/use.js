var error = require('../error')

// use('pluginname') - built-in, or provide calling code 'require' as seneca opt
// use( require('pluginname') ) - plugin object, init will be called
// if first arg has property senecaplugin
module.exports = function(root) {
  var private$ = root.private$

  return function api_use( arg0, arg1, arg2 ) {
    var self = this, plugindesc;

    // Allow chaining with seneca.use('options', {...})
    // see https://github.com/rjrodger/seneca/issues/80
    if( 'options' == arg0 ) {
      self.options( arg1 )
      return self
    }

    try {
      plugindesc = private$.use( arg0, arg1, arg2 )
    }
    catch(e) {
      return self.die( error(e,'plugin_'+e.code) );
    }

    self.register( plugindesc )

    return self
  }
}
