function api_listen() {
  var self = this

  self.log.info.apply(self,_.flatten([
    'listen',arguments[0],Array.prototype.slice.call(arguments,1),callpoint()
  ]))

  var opts   = self.options().transport || {}
  var config = parseConfig( arr(arguments), opts )

  self.act('role:transport,cmd:listen',{config:config,gate$:true},function(err) {
    if( err ) return self.die(error(err,'transport_listen',config))
  })

  return self
}
