var _           = require('lodash');
var common      = require('../lib/common');

module.exports = async function api_client() {
  var self = this

  self.log.info.apply(self,_.flatten([
    'client',arguments[0],Array.prototype.slice.call(arguments,1),callpoint()
  ]))

  var opts   = self.options().transport || {}
  var config = parseConfig( arr(arguments), opts )

  // Queue messages while waiting for client to become active.
  var sendqueue = []
  var sendclient = {
    send: function( args ) {
      var tosend = {instance:this, args:args }
      self.log.debug('client','sendqueue-add',sendqueue.length+1,config,tosend)
      sendqueue.push( tosend )
    }
  }

  // TODO: validate pin, pins args

  var pins = config.pins || [config.pin||'']

  pins = _.map(pins, function(pin){
    return _.isString(pin) ? jsonic(pin) : pin
  })


  _.each(pins,function(pin) {

    // Only wrap if pin is specific.
    // Don't want to wrap all patterns, esp. system ones!
    if( 0 < _.keys(pin).length ) {
      self.wrap(pin, async function(args) {
        await sendclient.send.call( this, args)
      })
    }

    // For patterns not locally defined.
    private$.clientrouter.add(
      pin,
      {
        func: async function(args) {
          await sendclient.send.call( this, args)
        },
        log:         self.log,
        argpattern:  common.argpattern(pin),
        pattern:     common.argpattern(pin),
        id:          'CLIENT',
        client$:     true,
        plugin_name:     'remote$',
        plugin_fullname: 'remote$',
      })
  })

  // Create client.
  self.act(
    'role:transport,cmd:client',
    {config:config,gate$:true},
    function(err,liveclient) {
      if( err ) return self.die(error(err,'transport_client',config));
      if( null == liveclient )
        return self.die(error('transport_client_null',common.clean(config)));

      // Process any messages waiting for this client,
      // before bringing client online.
      async function sendnext() {
        if( 0 === sendqueue.length ) {
          sendclient = liveclient
          self.log.debug('client','sendqueue-clear',config)
        }
        else {
          var tosend = sendqueue.shift()
          self.log.debug('client','sendqueue-processing',
                         sendqueue.length+1,config,tosend)
          await sendclient.send.call(tosend.instance,tosend.args)
          setImmediate(sendnext)
        }
      }
      sendnext()
    })

  return self;
}
