'use strict';

var _            = require('lodash');
var nid          = require('nid');
var jsonic       = require('jsonic');
var patrun       = require('patrun');
var logging      = require('../lib/logging');
var common       = require('../lib/common');
var make         = require('../make');

var Seneca = require('./constructor')
var VERSION = '0.6.4'

// Create a new root Seneca instance.
var root = new Seneca();

// Define public member variables.
root.root       = root;
root.start_time = Date.now();
root.fixedargs  = {};
root.context    = {};
root.version    = VERSION;

var api = require('./root/api')
root = api.decorate(root);

// TODO: fix so!!!
root.fail = make.make_legacy_fail( so )

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
root = require('./root/actions').decorate(root);

module.exports = root;
