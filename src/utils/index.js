var _   = require('lodash');
var gex          = require('gex');
// Utilities

module.exports.makedie = function makedie( instance, ctxt ) {
  ctxt = _.extend(ctxt,instance.die?instance.die.context:{})

  var die = function( err ) {
    var die_trace = '\n'+(new Error('die trace').stack)
          .match(/^.*?\n.*\n(.*)/)[1]

    try {
      if( !err ) {
        err = new Error( 'unknown' )
      }
      else if( !util.isError(err) ) {
        err = new Error( _.isString(err) ? err : util.inspect(err) )
      }

      var so = instance.options()

      // undead is only for testing, do not use in production
      var undead = so.debug.undead || (err && err.undead)

      var logargs = [ctxt.type, ctxt.plugin, ctxt.tag, ctxt.id,
                     err.code, err.message, err.details,
                     instance.fixedargs.fatal$?'all-errors-fatal':'-',
                     ctxt.callpoint()]

      instance.log.fatal.apply( instance, logargs )

      var stack = err.stack || ''
      stack = stack.replace(/^.*?\n/,'\n')

      var procdesc = '\n  pid='+process.pid+
            ', arch='+process.arch+
            ', platform='+process.platform+
            ',\n  path='+process.execPath+
            ',\n  argv='+util.inspect(process.argv).replace(/\n/g,'')+
            ',\n  env='+util.inspect(process.env).replace(/\n/g,'')

      var fatalmodemsg = instance.fixedargs.fatal$ ?
            '\n  ALL ERRORS FATAL: action called with argument fatal$:true '+
            '(probably a plugin init error, or using a plugin seneca instance'+
            ', see senecajs.org/fatal.html)' : ''

      var stderrmsg =
            "\n\n"+
            "Seneca Fatal Error\n"+
            "==================\n\n"+
            "Message: "+err.message+"\n\n"+
            "Code: "+err.code+"\n\n"+
            "Details: "+util.inspect(err.details,{depth:null})+"\n\n"+
            "Stack: "+stack+"\n\n"+
            "Instance: "+instance.toString()+fatalmodemsg+die_trace+"\n\n"+
            "When: "+new Date().toISOString()+"\n\n"+
            "Log: "+jsonic.stringify(logargs)+"\n\n"+
            "Node:\n  "+util.inspect(process.versions).replace(/\s+/g,' ')+
            ",\n  "+util.inspect(process.features).replace(/\s+/g,' ')+
            ",\n  "+util.inspect(process.moduleLoadList).replace(/\s+/g,' ')+"\n\n"+
            "Process: "+procdesc+"\n\n"


      if( so.errhandler ) {
        so.errhandler.call(instance,err)
      }

      if( instance.closed ) return;

      if( !undead ) {
        instance.close(
          // terminate process, err (if defined) is from seneca.close
          function ( err ) {
            if( !undead ) {
              process.nextTick(function() {
                if( err ) console_error( err );
                console_error( stderrmsg )
                console_error("\n\nSENECA TERMINATED at "+(new Date().toISOString())+
                              ". See above for error report.\n\n")
                process.exit(1)
              })
            }
          }
        )
      }

      // make sure we close down within options.deathdelay seconds
      if( !undead ) {
        var killtimer = setTimeout(function() {
          console_error( stderrmsg )
          console_error("\n\nSENECA TERMINATED (on timeout) at "+
                        (new Date().toISOString())+".\n\n")
          process.exit(2);
        }, so.deathdelay);
        killtimer.unref();
      }
    }
    catch(panic) {
      var msg =
            "\n\n"+
            "Seneca Panic\n"+
            "============\n\n"+
            panic.stack+
            "\n\nOrginal Error:\n"+
            (arguments[0] && arguments[0].stack ? arguments[0].stack : arguments[0])
      console_error(msg)
    }
  }

  die.context = ctxt

  return die
}



module.exports.make_trace_act = function make_trace_act( opts ) {
  return function() {
    var args = Array.prototype.slice.call(arguments,0)
    args.unshift(new Date().toISOString())

    if( opts.stack ) {
      args.push(new Error('trace...').stack)
    }

    console_log(args.join('\t'))
  }
}


module.exports.pin_patrun_customizer = function pin_patrun_customizer(pat,data) {
  /* jshint validthis:true */

  var pi = this

  var gexers = {}
  _.each(pat, function(v,k) {
    if( _.isString(v) && ~v.indexOf('*') ) {
      delete pat[k]
      gexers[k] = gex(v)
    }
  })

  // handle previous patterns that match this pattern
  var prev     = pi.list(pat)
  var prevfind = prev[0] && prev[0].find
  var prevdata = prev[0] && pi.findexact(prev[0].match)

  return function(args,data) {
    var pi  = this
    var out = data
    _.each(gexers,function(g,k) {
      var v = args[k]
      if( null == g.on( v ) ) { out = null }
    })

    if( prevfind && null == out ) {
      out = prevfind.call(pi,args,prevdata)
    }

    return out
  }
}

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


// Minor utils
module.exports.thrower = function thrower(err) {
  if( err ) throw err;
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
