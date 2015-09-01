var _          = require('lodash');
var nid        = require('nid');
var patrun     = require('patrun');
var makeuse      = require('use-plugin');
var lrucache     = require('lru-cache');
var executor     = require('gate-executor');

var make_entity   = require('./lib/entity');
var make_optioner = require('./lib/optioner');
var logging       = require('./lib/logging');
var common        = require('./lib/common');


// Create a new Seneca instance.
// * _initial_options_ `o` &rarr; instance options
module.exports = function make_seneca( initial_options ) {
  /* jshint validthis:true */

  initial_options = initial_options || {}; // ensure defined

  // Create a private context.
  var private$ = make_private();

  // Create a new root Seneca instance.
  var root = require('./root')

  // Create internal tools.
  var actnid     = nid({length:5})
  var refnid     = function(){ return '('+actnid()+')' }
  var paramcheck = make_paramcheck()
  var argv       = cmdline(root)

  // Create option resolver.
  private$.optioner = make_optioner(
    argv,
    initial_options.module || module.parent || module,
    DEFAULT_OPTIONS )

  // Not needed after this point, and screws up debug printing.
  delete initial_options.module

  // Define options
  var so = private$.optioner.set( initial_options )
  paramcheck.options.validate(so,thrower)

  // These need to come from options as required during construction.
  so.internal.actrouter    = so.internal.actrouter    || patrun()
  so.internal.clientrouter = so.internal.clientrouter || patrun(pin_patrun_customizer)
  so.internal.subrouter    = so.internal.subrouter    || patrun(pin_patrun_customizer)

  var callpoint = make_callpoint( so.debug.callpoint )


  // TODO: support options
  private$.executor = executor({
    trace:   _.isFunction(so.trace.act) ? so.trace.act :
      (!!so.trace.act) ? make_trace_act({stack:so.trace.stack}) : false,
    timeout: so.timeout,
    error: function(err) {
      if( !err ) return;
      logging.log_exec_err( root, err )
    },
    msg_codes: {
      timeout:   'action-timeout',
      error:     'action-error',
      callback:  'action-callback',
      execute:   'action-execute',
      abandoned: 'action-abandoned'
    }
  })

  // setup status log
  if( 0 < so.status.interval && so.status.running ) {
    private$.stats = private$.stats || {}
    setInterval(function() {
      var status = {
        alive: (Date.now()-private$.stats.start),
        act:   private$.stats.act
      }
      root.log.info('status',status)
    },so.status.interval)
  }

  if( so.stats ) {
    private$.timestats = new stats.NamedStats( so.stats.size, so.stats.interval )

    if( so.stats.running ) {
      setInterval(function() {
        private$.timestats.calculate()
      }, so.stats.interval )
    }
  }

  private$.plugins      = {}
  private$.exports      = { options: common.deepextend({},so) }
  private$.plugin_order = { byname:[], byref:[] }
  private$.use          = makeuse({
    prefix:    'seneca-',
    module:    module,
    msgprefix: false,
    builtin:   ''
  })

  private$.actcache = ( so.actcache.active ?
                        lrucache({max:so.actcache.size}) :
                        {set:_.noop} )

  private$.wait_for_ready = false

  private$.actrouter    = so.internal.actrouter
  private$.clientrouter = so.internal.clientrouter
  private$.subrouter    = so.internal.subrouter



  if( so.debug.print.options ) {
    console_log('\nSeneca Options ('+root.id+'): before plugins\n'+
                '===\n')
    console_log(util.inspect(so,{depth:null}))
    console_log('')
  }

  var pm_custom_args = {
    rules: {
      entity$: function(ctxt,cb) {
        var val = ctxt.point
        if( val.entity$ ) {
          if( val.canon$({isa:ctxt.rule.spec}) ) {
            return cb();
          }
          else return ctxt.util.fail(ctxt,cb);
        }
        else return ctxt.util.fail(ctxt,cb);
      }
    },
    msgs: {
      entity$: 'The value <%=value%> is not a data entity of kind <%=rule.spec%>'+
        ' (property <%=parentpath%>).'
    }
  }

  function api_has(args) {
    return !!private$.actrouter.find(args)
  }


  // Create entity delegate.
  var sd = root.delegate()
  sd.log = function() {
    var args = ['entity']
    root.log.apply(this,args.concat(arr(arguments)))
  }
  logging.makelogfuncs(sd)


  // Template entity that makes all others.
  private$.entity = make_entity({},sd)

  private$.exports.Entity = make_entity.Entity

  cmdline.handle( root, argv )

  _.each( so.internal.close_signals, function(active,signal){
    if(active) {
      process.on(signal,function(){
        root.close(function(err){
          if( err ) console.error(err);
          process.exit( err ? (null == err.exit ? 1 : err.exit) : 0 )
        })
      })
    }
  })

  return root
  }

}
