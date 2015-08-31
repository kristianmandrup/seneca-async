module.exports = function api_start( errhandler ) {
  var sd = this.delegate()
  var options = sd.options()
  options.zig = options.zig || {}

  function make_fn(self,origargs) {
    var args = parse_pattern(self,origargs,'fn:f?')

    var actargs = _.extend(
      {},
      args.moreobjargs ? args.moreobjargs : {},
      args.objargs ? args.objargs : {},
      args.strargs ? jsonic( args.strargs ) : {}
    )

    var fn
    if( args.fn ) {
      fn = async function(data){
        return await args.fn.call(self,data)
      }
    }
    else {
      fn = async function(data){
        /* jshint evil:true */

        if( args.strargs ) {
          var $ = data
          _.each(actargs,function(v,k){
            if( _.isString(v) && 0===v.indexOf('$.') ) {
              actargs[k] = eval(v)
            }
          })
        }

        await self.act(actargs)
        return true
      }
      fn.nm = args.strargs
    }

    return fn
  }


  var dzig = zig({
    timeout: options.zig.timeout || options.timeout,
    trace: options.zig.trace
  })

  dzig.start(function(){
    var self = this
    dzig.end(function(){
      if( errhandler ) errhandler.apply(self,arguments);
    })
  })

  sd.end = async function(){
    var self = this
    await dzig.end(function(){
      if( errhandler ) return errhandler.apply(self,arguments);
    })
    return self
  }

  sd.wait = function(){
    dzig.wait(make_fn(this,arguments))
    return this
  }

  sd.step = function(){
    dzig.step(make_fn(this,arguments))
    return this
  }

  sd.run = function(){
    dzig.run(make_fn(this,arguments))
    return this
  }

  sd.if = function(cond){
    dzig.if(cond)
    return this
  }

  sd.endif = function(){
    dzig.endif()
    return this
  }

  sd.fire = function(){
    dzig.step(make_fn(this,arguments))
    return this
  }

  return sd
}
