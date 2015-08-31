module.exports = function api_actroutes() {
  return private$.actrouter.toString(function(d) {
    var s = 'F='

    if( d.plugin_fullname ) {
      s+=d.plugin_fullname+'/'
    }

    s+=d.id

    while( d.priormeta ) {
      d = d.priormeta
      s+=';'

      if( d.plugin_fullname ) {
        s+=d.plugin_fullname+'/'
      }

      s+=d.id

    }
    return s
  })
}
