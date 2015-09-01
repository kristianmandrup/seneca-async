var _            = require('lodash');
var logging      = require('./lib/logging');

module.exports = function callback_error( instance, err, actmeta, result,
                         duration, callargs, prior_ctxt, act_callpoint )
{
  if( !err.seneca ) {
    err = error(err,'act_callback',_.extend(
      {},
      err.details,
      {
        message:  err.message,
        pattern:  actmeta.pattern,
        fn:       actmeta.func,
        cb:       cb,
        instance: instance.toString()
      }))

    result[0] = err
  }

  err.details = err.details || {}
  err.details.plugin = err.details.plugin || {}

  logging.log_act_err( root, {
    actid:    callargs.id$ || callargs.actid$,
    duration: duration
  }, actmeta, callargs, prior_ctxt, err, act_callpoint )

  instance.emit('act-err',callargs,err,result[1])

  if( so.errhandler ) {
    so.errhandler.call(instance,err)
  }
}
