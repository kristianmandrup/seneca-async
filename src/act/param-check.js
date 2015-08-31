// Check if action parameters pass parambulator spec, if any.
//
//    * _args_     (object)    &rarr;  action arguments
//    * _actmeta_  (object)    &rarr;  action meta data
//    * _done_     (function)  &rarr;  callback function
module.exports = function async act_param_check( args, actmeta ) {
  assert.ok( _.isObject(args),    'act_param_check; args; isObject')
  assert.ok( _.isObject(actmeta), 'act_param_check; actmeta; isObject')

  if( actmeta.parambulator ) {
    try {
      await actmeta.parambulator.validate(args);
    } catch(err) {
      return error('act_invalid_args', {
        pattern: actmeta.pattern,
        message: err.message,
        args:    common.clean(args)
      }));
    }
  }
  else return;
}
