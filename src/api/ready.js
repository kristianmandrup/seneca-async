var _            = require('lodash');
// useful when defining services!
// note: has EventEmitter.once semantics
// if using .on('ready',fn) it will be be called for each ready event
module.exports = function api_ready(ready) {
  var self = this

  if( so.debug.callpoint ) {
    self.log.debug( 'ready', 'register', callpoint() )
  }

  if( _.isFunction(ready) ) {
    self.once('ready',function(){
      try {
        var ready_delegate = self.delegate({fatal$:true})
        ready.call(ready_delegate)
      }
      catch(ex) {
        var re = ex

        if( !re.seneca ) {
          re = error(re,'ready_failed', {message:ex.message,ready:ready})
        }

        self.die( re )
      }
    })

    if( !private$.wait_for_ready ) {
      private$.wait_for_ready = true
      self.act('role:seneca,ready:true,gate$:true')
    }
  }

  return self;
}
