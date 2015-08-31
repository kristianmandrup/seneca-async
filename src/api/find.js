module.exports = function api_find(args) {
  var local  = true
  var remote = true

  if( _.isString( args ) ) {
    args = jsonic( args )
  }

  if( _.isBoolean(args.local$) ) {
    local  = args.local$
    remote = !args.local$
  }

  var actmeta = local && private$.actrouter.find(args)

  if( remote && !actmeta ) {
    actmeta = private$.clientrouter.find(args)
  }

  return actmeta
}
