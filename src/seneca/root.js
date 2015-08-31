// Create a new root Seneca instance.
var root = new Seneca();


// Define public member variables.
root.root       = root;
root.start_time = Date.now();
root.fixedargs  = {};
root.context    = {};
root.version    = VERSION;


// Seneca methods. Official API.
root.add        = api_add        // Add a message pattern and action.
root.act        = api_act        // Perform action that matches pattern.
root.sub        = api_sub        // Subscribe to a message pattern.
root.use        = api_use        // Define a plugin.
root.make       = api_make       // Make a new entity object.
root.listen     = api_listen     // Listen for inbound messages.
root.client     = api_client     // Send outbound messages.
root.export     = api_export     // Export plain objects from a plugin.
root.has        = api_has        // True if action pattern defined.
root.find       = api_find       // Find action by pattern
root.list       = api_list       // List (a subset of) action patterns.
root.ready      = api_ready      // Callback when plugins initialized.
root.close      = api_close      // Close and shutdown plugins.
root.options    = api_options    // Get and set options.
root.repl       = api_repl       // Open a REPL on a local port.
root.start      = api_start      // Start an action chain.
root.error      = api_error      // Set global error handler.

// Method aliases.
root.make$      = api_make
root.hasact     = api_has

// Non-API methods.
root.logroute   = api_logroute
root.register   = api_register
root.depends    = api_depends
root.cluster    = api_cluster
root.hasplugin  = api_hasplugin
root.findplugin = api_findplugin
root.pin        = api_pin
root.actroutes  = api_actroutes
root.act_if     = api_act_if
root.wrap       = api_wrap
root.seneca     = api_seneca
root.fix        = api_fix
root.delegate   = api_delegate

// Legacy API; Deprecated.
root.startrepl = api_repl
root.findact   = api_find

root.fail = make_legacy_fail( so )

// Identifier generator.
root.idgen = nid({length:so.idlen})

// Create a unique identifer for this instance.
root.id = root.idgen()+'/'+root.start_time+'/'+process.pid+'/'+so.tag

if( so.debug.short_logs || so.log.short ) {
  so.idlen    = 2
  root.idgen  = nid({length:so.idlen})
  root.id     = root.idgen()+'/'+so.tag
}

root.name = 'Seneca/'+root.version+'/'+root.id

root.die = makedie( root, {
  type:      'sys',
  plugin:    'seneca',
  tag:       root.version,
  id:        root.id,
  callpoint: callpoint
})

// Configure logging
root.log = logging.makelog(so.log,{
  id:    root.id,
  start: root.start_time,
  short: !!so.debug.short_logs
})

// Error events are fatal, unless you're undead.  These are not the
// same as action errors, these are unexpected internal issues.
root.on('error',root.die)

root.on('newListener', function(eventname) {
  if( 'ready' == eventname ) {
    if( !private$.wait_for_ready ) {
      private$.wait_for_ready = true
      root.act('role:seneca,ready:true,gate$:true')
    }
  }
})

root.toString = api_toString

root.util = {
  deepextend: common.deepextend,
  recurse:    common.recurse,
  clean:      common.clean,
  copydata:   common.copydata,
  nil:        common.nil,
  argprops:   common.argprops,
  print:      common.print,

  router:     function() { return patrun() },
  parsecanon: make_entity.parsecanon,
}

root.store = {
  init: store.init,
  cmds: store.cmds
}

// say hello, printing identifier to log
root.log.info( 'hello', root.toString(), callpoint() )

// dump options if debugging
root.log.debug('options',function() {
  return util.inspect(so,false,null).replace(/[\r\n]/g,' ')
})

root.make$ = root.make
// TODO: deprecate
root.findpins = root.pinact = function() {
  var pins = []
  var patterns = _.flatten(arr(arguments))

  _.each( patterns, function(pattern) {
    pattern = _.isString(pattern) ? jsonic(pattern) : pattern
    pins = pins.concat( _.map( private$.actrouter.list(pattern),
                               function(desc) {return desc.match} ) )
  })

  return pins
}

// TODO: move repl functionality to seneca-repl

root.inrepl = function() {
  var self = this

  self.on('act-out',function() {
    logging.handlers.print.apply(null,arr(arguments))
  })

  self.on('error',function(err) {
    var args = arr(arguments).slice()
    args.unshift('ERROR: ')
    logging.handlers.print.apply(null,arr(args))
  })
}

// DEPRECATED
// for use with async
root.next_act = function() {
  var si   = this || root
  var args = arr(arguments)

  return function(next) {
    args.push(next)
    si.act.apply(si,args)
  }
}

root.gate = function() {
  var gated = this.delegate({gate$:true})
  return gated
}
root.ungate = function() {
  var ungated = this.delegate({gate$:false})
  return ungated
}

// Add builtin actions.
root.add( {role:'seneca',  stats:true},  action_seneca_stats )
root.add( {role:'seneca',  ready:true},  action_seneca_ready )
root.add( {role:'seneca',  cmd:'close'}, action_seneca_close )
root.add( {role:'options', cmd:'get'},   action_options_get  )
