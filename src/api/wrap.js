module.exports = function api_wrap(pin,wrapper) {
  var pinthis = this

  pin = _.isArray(pin) ? pin : [pin]
  _.each(pin, function(p) {
    _.each( pinthis.findpins(p), function(actpattern) {
      pinthis.add(actpattern, async function(args) {
        await wrapper.call(this,args)
      })
    })
  })
}
