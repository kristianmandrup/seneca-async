var jsonic       = require('jsonic');
var _            = require('lodash');

module.exports = function(root) {
  return function api_find(args) {
    var local  = true
    var remote = true
    // var private$ = root.private$

    if( _.isString( args ) ) {
      args = jsonic( args )
    }

    if( _.isBoolean(args.local$) ) {
      local  = args.local$
      remote = !args.local$
    }

    var actmeta = local && root.so.internal.actrouter.find(args)

    if( remote && !actmeta ) {
      actmeta = root.so.internal.clientrouter.find(args)
    }

    return actmeta
  }
}
