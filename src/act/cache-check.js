// Check if actid has already been seen, and if action cache is active,
// then provide cached result, if any. Return true in this case.
//
//    * _instance_      (object)    &rarr;  seneca instance
//    * _args_          (object)    &rarr;  action arguments
//    * _prior_ctxt_    (object?)   &rarr;  prior action context, if any
//    * _act_callpoint_ (function)  &rarr;  action call point
module.exports = function act_cache_check( instance, args, prior_ctxt, act_callpoint ) {
  assert.ok( _.isObject(instance), 'act_cache_check; instance; isObject')
  assert.ok( _.isObject(args),     'act_cache_check; args; isObject')
  assert.ok( !prior_ctxt || _.isObject(prior_ctxt),
             'act_cache_check; prior_ctxt; isObject')
  assert.ok( !actcb || _.isFunction(actcb),
             'act_cache_check; actcb; isFunction')

  var actid = args.id$ || args.actid$

  if( null != actid && so.actcache.active ) {
    var actdetails = private$.actcache.get(actid)

    if( actdetails ) {
      var actmeta = actdetails.actmeta || {}
      private$.stats.act.cache++

      logging.log_act_cache( root, {actid:actid}, actmeta,
                             args, prior_ctxt, act_callpoint )

      if( actcb ) actcb.apply( instance, actdetails.result );
      return true;
    }
  }

  return false;
}
