var _            = require('lodash');
var logging      = require('./lib/logging');

module.exports = function act_make_delegate( instance, tx, callargs, actmeta, prior_ctxt ) {
  var delegate_args = {}
  if( null != callargs.gate$ ) {
    delegate_args.ungate$ = !!callargs.gate$
  }

  var delegate = instance.delegate( delegate_args )

  // special overrides
  if( tx ) { delegate.fixedargs.tx$ = tx }

  // automate actid log insertion
  delegate.log = logging.make_delegate_log( callargs.meta$.id, actmeta, instance )
  logging.makelogfuncs(delegate)

  if( actmeta.priormeta ) {
    delegate.prior = async function(prior_args) {
      prior_args = _.clone(prior_args)

      var sub_prior_ctxt = _.clone(prior_ctxt)
      sub_prior_ctxt.chain = _.clone(prior_ctxt.chain)
      sub_prior_ctxt.chain.push( actmeta.id )
      sub_prior_ctxt.entry = false
      sub_prior_ctxt.depth++;

      delete prior_args.id$
      delete prior_args.actid$
      delete prior_args.meta$
      delete prior_args.transport$

      if( callargs.default$ ) {
        prior_args.default$ = callargs.default$
      }

      prior_args.tx$ = tx

      await do_act(delegate,actmeta.priormeta,sub_prior_ctxt,prior_args)
    }
  }
  else delegate.prior = async function( msg ) {
    var out = callargs.default$ ? callargs.default$ : null
    await out(msg);
  }

  return delegate;
}
