var parambulator = require('parambulator');
var _            = require('lodash');
var common       = require('../lib/common');

module.exports.make_entity   = require('../lib/entity');
module.exports.make_optioner = require('../lib/optioner');

// Private member variables of Seneca object.
module.exports.make_private = function make_private() {
  return {
    stats: {
      start: Date.now(),
      act: {
        calls: 0,
        done:  0,
        fails: 0,
        cache: 0
      },
      actmap:{}
    }
  }
}

// Make parambulators.
module.exports.make_paramcheck = function make_paramcheck() {
  var paramcheck = {}

  paramcheck.options = parambulator({
    tag:        { string$:true },
    idlen:      { integer$:true },
    timeout:    { integer$:true },
    errhandler: { function$:true },
  },{
    topname:       'options',
    msgprefix:     'seneca( {...} ): ',
  })

  paramcheck.register = parambulator({
    type$:     'object',
    required$: ['name','init'],
    string$:   ['name'],
    function$: ['init','service'],
    object$:   ['options']
  },{
    topname:       'plugin',
    msgprefix:     'register(plugin): ',
  })

  return paramcheck
}

// Callpoint resolver. Indicates location in calling code.
module.exports.make_callpoint = function make_callpoint( active ) {
  if( active ) {
    return function() {
      return error.callpoint(
        new Error(),
        ['/seneca/seneca.js','/seneca/lib/', '/lodash.js'] )
    }

  } else return _.noop;
}


// For backwards compatibility
module.exports.make_legacy_fail = function make_legacy_fail(so) {
  return function(){
    var args = common.arrayify(arguments)

    var cb = _.isFunction(arguments[arguments.length-1]) ?
          arguments[arguments.length-1] : null

    if( cb ) {
      args.pop()
    }

    if( _.isObject( args[0] ) ) {
      var code = args[0].code
      if( _.isString(code) ) {
        args.unshift(code)
      }
    }

    var err = error.apply(null,args)
    err.callpoint = new Error().stack.match(/^.*\n.*\n\s*(.*)/)[1]
    err.seneca = { code: err.code, valmap:err.details }

    this.log.error(err)
    if( so.errhandler ) {
      so.errhandler.call(this,err)
    }

    if( cb ) {
      cb.call(this,err)
    }

    return err;
  }
}
