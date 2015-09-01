var _            = require('lodash');
var common       = require('../lib/common');

module.exports = function(root) {
  var private$ = root.private$

  return function api_pin( pattern, pinopts ) {
    var thispin = this

    pattern = _.isString( pattern ) ? jsonic(pattern) : pattern

    var methodkeys = []
    for( var key in pattern ) {
      if( /[\*\?]/.exec(pattern[key]) ) {
        methodkeys.push(key)
      }
    }

    var methods = private$.actrouter.list(pattern)

    var api = {
      toString: function() {
        return 'pin:'+common.argpattern(pattern)+'/'+thispin
      }
    }

    methods.forEach(function(method) {
      var mpat = method.match

      var methodname = ''
      for(var mkI = 0; mkI < methodkeys.length; mkI++) {
        methodname += ((0<mkI?'_':'')) + mpat[methodkeys[mkI]]
      }

      api[methodname] = function(args,cb) {
        var si = this && this.seneca ? this : thispin

        var fullargs = _.extend({},args,mpat)
        si.act.call(si,fullargs,cb)
      }

      api[methodname].pattern$ = method.match
      api[methodname].name$    = methodname
    })

    if( pinopts ) {
      if( pinopts.include ) {
        for( var i = 0; i < pinopts.include.length; i++ ) {
          var methodname = pinopts.include[i]
          if( thispin[methodname] ) {
            api[methodname] = common.delegate(thispin,thispin[methodname])
          }
        }
      }
    }

    return api
  }
}
