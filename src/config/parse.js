module.exports = function parseConfig( args, options ) {
  var out = {}

  var config = args.config || args

  if( _.isArray( config ) ) {
    var arglen = config.length

    if( 1 === arglen ) {
      if( _.isObject( config[0] ) ) {
        out = config[0]
      }
      else {
        out.port = parseInt(config[0],10)
      }
    }
    else if( 2 === arglen ) {
      out.port = parseInt(config[0],10)
      out.host = config[1]
    }
    else if( 3 === arglen ) {
      out.port = parseInt(config[0],10)
      out.host = config[1]
      out.path = config[2]
    }

  }

  // TODO: accept a jsonic string

  else out = config;

  _.each( options, function(v,k){
    if( _.isObject(v) ) return;
    out[k] =  ( void 0 === out[k] ? v : out[k] )
  })


  // Default transport is web
  out.type = out.type || 'web'

  // Aliases.
  if( 'direct' == out.type || 'http' == out.type ) {
    out.type = 'web'
  }

  var base = options[out.type] || {}

  out = _.extend({},base,out)

  if( 'web' == out.type || 'tcp' == out.type ) {
    out.port = null == out.port ? base.port : out.port
    out.host = null == out.host ? base.host : out.host
    out.path = null == out.path ? base.path : out.path
  }

  return out
}
