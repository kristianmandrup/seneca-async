var logging      = require('./lib/logging');

module.exports = function api_options( options ) {
  var self = this

  if( null != options ) {
    self.log.debug( 'options', 'set', options, callpoint() )
  }

  so = private$.exports.options =( (null == options) ?
                                   private$.optioner.get() :
                                   private$.optioner.set( options ) )

  if( options && options.log ) {
    self.log = logging.makelog(so.log,self.id,self.start_time)
  }

  return so
}
