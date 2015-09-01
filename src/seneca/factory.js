var _          = require('lodash');
var patrun     = require('patrun');
var makeuse      = require('use-plugin');
var lrucache     = require('lru-cache');
var executor     = require('gate-executor');

var make_entity   = require('../lib/entity');
var make_optioner = require('../lib/optioner');
var logging       = require('../lib/logging');
var common        = require('../lib/common');
var cmdline       = require('../lib/cmdline');
var make          = require('../make');

// Create a new Seneca instance.
// * _initial_options_ `o` &rarr; instance options
module.exports = function make_seneca( initial_options ) {
  /* jshint validthis:true */

  initial_options = initial_options || {}; // ensure defined

  // Create a private context.
  var private$ = make.make_private();

  // Create a new root Seneca instance.
  var root = require('./root')(private$, initial_options);
  var so = root.so;

  // Create internal tools.
  var argv       = cmdline(root)

  // Not needed after this point, and screws up debug printing.
  delete initial_options.module

  // TODO: debug here!!!
  require('./private').bind(this)(private$, so)

  if( so.debug.print.options ) {
    console_log('\nSeneca Options ('+root.id+'): before plugins\n'+
                '===\n')
    console_log(util.inspect(so,{depth:null}))
    console_log('')
  }

  var pm_custom_args = require('./custom-args')

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
