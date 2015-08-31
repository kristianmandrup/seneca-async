module.exports = function api_sub() {
  var self = this

  var subargs = parse_pattern(self,arguments,'action:f actmeta:o?')
  var pattern = subargs.pattern
  if( null == pattern.in$ &&
      null == pattern.out$ &&
      null == pattern.error$ &&
      null == pattern.cache$ &&
      null == pattern.default$ &&
      null == pattern.client$ )
  {
    pattern.in$ = true
  }

  if( !private$.handle_sub ) {
    private$.handle_sub = function(args,result) {
      var subfuncs = private$.subrouter.find(args)

      if( subfuncs ) {
        _.each(subfuncs,function(subfunc){
          try {
            subfunc.call(self,args,result)
          }
          catch(ex) {
            // TODO: not really satisfactory
            var err = error(ex,'sub_function_catch',{args:args,result:result});
            self.log.error(
              'sub','err',args.meta.id$, err.message, args, error.stack );
          }
        })
      }
    }

    // TODO: other cases

    // Subs are triggered via events
    self.on('act-in',  annotate( 'in$',  private$.handle_sub));
    self.on('act-out', annotate( 'out$', private$.handle_sub));
  }

  function annotate( prop, handle_sub ) {
    return function( args,result ) {
      args   = _.clone(args);
      result = _.clone(result);
      args[prop] = true;
      handle_sub(args,result);
    }
  }

  var subs = private$.subrouter.find(pattern)
  if( !subs ) {
    private$.subrouter.add(pattern,subs=[]);
  }
  subs.push(subargs.action);

  return self;
}
