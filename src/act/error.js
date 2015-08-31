module.exports = function act_error( instance, err, actmeta, result,
                    duration, callargs, prior_ctxt, act_callpoint )
{
  if( !err.seneca ) {
    err = error(err,'act_execute',_.extend(
      {},
      err.details,
      {
        message:  (err.eraro && err.orig) ? err.orig.message : err.message,
        pattern:  actmeta.pattern,
        fn:       actmeta.func,
        instance: instance.toString()
      }))

    result[0] = err
  }

  // Special legacy case for seneca-perm
  else if( err.orig &&
           _.isString(err.orig.code) &&
           0 === err.orig.code.indexOf('perm/') )
  {
    err = err.orig
    result[0] = err
  }

  err.details = err.details || {}
  err.details.plugin = err.details.plugin || {}

  logging.log_act_err( root, {
    actid:    callargs.id$ || callargs.actid$,
    duration: duration
  }, actmeta, callargs, prior_ctxt, err, act_callpoint )

  instance.emit('act-err',callargs,err)

  if( so.errhandler ) {
    call_cb = !so.errhandler.call(instance,err)
  }

  // FUCK THIS!!! avoid all this CallBack shit!
  return {call_cb:call_cb, err:err}
}
