// close seneca instance
// sets public seneca.closed property
module.exports = async function api_close() {
  var self = this

  self.closed = true

  self.log.debug( 'close', 'start', callpoint() )
  await self.act('role:seneca,cmd:close,closing$:true', function(err) {
    self.log.debug('close','end',err)
  })
}
