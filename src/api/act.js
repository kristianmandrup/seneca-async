var _            = require('lodash');
var norma        = require('norma');
var logging      = require('../lib/logging');
var common       = require('../lib/common');

// Perform an action. The properties of the first argument are matched against
// known patterns, and the most specific one wins.
module.exports = async function api_act() {
  var self = this

  var spec    = parse_pattern( self, common.arrayify(arguments) )
  var args    = spec.pattern

  args = _.extend(args,self.fixedargs)
  var actmeta = self.find(args)

  if( so.debug.act_caller ) {
    args.caller$ = '\n    Action call arguments and location: '+
      (new Error(util.inspect(args).replace(/\n/g,'')).stack)
      .replace(/.*\/seneca\.js:.*\n/g,'')
      .replace(/.*\/seneca\/lib\/.*\.js:.*\n/g,'')
  }

  // action pattern found
  if( actmeta ) {
    await do_act(self,actmeta,false,args)
    return self;
  }

  // action pattern not found

  if( _.isPlainObject( args.default$ ) ) {
    self.log.debug('act','-','-','DEFAULT',self.util.clean(args),callpoint())
    return self;
  }

  var errcode = 'act_not_found'
  var errinfo = { args: util.inspect(common.clean(args)).replace(/\n/g,'') }


  if( !_.isUndefined( args.default$ ) ) {
    errcode = 'act_default_bad'
    errinfo.xdefault = util.inspect(args.default$)
  }

  var err = error( errcode, errinfo )

  if( args.fatal$ ) {
    return self.die(err)
  }

  logging.log_act_bad( root, err, so.trace.unknown )

  if( so.debug.fragile ) throw err;

  return self;
}
