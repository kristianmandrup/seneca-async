
// ### seneca.add
// Add an message pattern and action function.
//
// `seneca.add( pattern, action )`
//    * _pattern_ `o|s` &rarr; pattern definition
//    * _action_ `f` &rarr; pattern action function
//
// `seneca.add( pattern_string, pattern_object, action )`
//    * _pattern_string_ `s` &rarr; pattern definition as jsonic string
//    * _pattern_object_ `o` &rarr; pattern definition as object
//    * _action_ `f` &rarr; pattern action function
//
// The pattern is defined by the top level properties of the
// _pattern_ parameter.  In the case where the pattern is a string,
// it is first parsed by
// [jsonic](https://github.com/rjrodger/jsonic)
//
// If the value of a pattern property is a sub-object, this is
// interpreted as a
// [parambulator](https://github.com/rjrodger/parambulator)
// validation check. In this case, the property is not considered
// part of the pattern, but rather an argument to validate when
// _seneca.act_ is called.
module.exports = function api_add() {
  var self = this
  var args = parse_pattern(self,arguments,'action:f actmeta:o?')

  var pattern   = args.pattern
  var action    = args.action
  var actmeta   = args.actmeta || {}

  actmeta.plugin_name     = actmeta.plugin_name || 'root$'
  actmeta.plugin_fullname = actmeta.plugin_fullname ||
    actmeta.plugin_name + (actmeta.plugin_tag ? '/' + actmeta.plugin_tag : '')

  var add_callpoint = callpoint()
  if( add_callpoint ) {
    actmeta.callpoint = add_callpoint
  }

  actmeta.sub = !!pattern.sub$

  // Deprecate a pattern by providing a string message using deprecate$ key.
  actmeta.deprecate = pattern.deprecate$

  var strict_add
        = (pattern.strict$ && null != pattern.strict$.add)
        ? !!pattern.strict$.add
        : !!so.strict.add

  pattern = self.util.clean(args.pattern)

  if( 0 === _.keys( pattern ) ) {
    throw error('add_empty_pattern',{args:common.clean(args)})
  }

  var pattern_rules = _.clone(action.validate || {})
  _.each( pattern, function(v,k) {
    if( _.isObject(v) ) {
      pattern_rules[k] = v
      delete pattern[k]
    }
  })

  if( 0 < _.keys(pattern_rules).length ) {
    actmeta.parambulator = parambulator(pattern_rules, pm_custom_args)
  }

  var addroute  = true

  actmeta.args = _.clone( pattern )
  actmeta.pattern = common.argpattern( pattern )

  // deprecated
  actmeta.argpattern = actmeta.pattern

  //actmeta.id = self.idgen()
  actmeta.id = refnid()

  actmeta.func = action

  var priormeta = self.find( pattern )

  // only exact action patterns are overridden
  // use .wrap for pin-based patterns
  if( strict_add && priormeta && priormeta.pattern !== actmeta.pattern ) {
    priormeta = null
  }


  if( priormeta ) {
    if( _.isFunction(priormeta.handle) ) {
      priormeta.handle(action)
      addroute = false
    }
    else {
      actmeta.priormeta = priormeta
    }
    actmeta.priorpath = priormeta.id+';'+priormeta.priorpath
  }
  else {
    actmeta.priorpath = ''
  }


  // FIX: need a much better way to support layered actions
  // this ".handle" hack is just to make seneca.close work
  if( action && actmeta && _.isFunction(action.handle) ) {
    actmeta.handle = action.handle
  }


  private$.stats.actmap[actmeta.argpattern] =
    private$.stats.actmap[actmeta.argpattern] ||
    {id:actmeta.id,
     plugin:{
       full: actmeta.plugin_fullname,
       name: actmeta.plugin_name,
       tag:  actmeta.plugin_tag
     },
     prior:actmeta.priorpath,calls:0,done:0,fails:0,time:{}}

  if( addroute ) {
    var addlog = [ actmeta.sub ? 'SUB' : 'ADD',
                   actmeta.id, common.argpattern(pattern), action.name,
                   callpoint() ]
    var isplugin = self.context.isplugin
    var logger   = self.log.log || self.log

    if( !isplugin ) {
      //addlog.unshift('-')
      //addlog.unshift('-')
      //addlog.unshift('-')
      addlog.unshift(actmeta.plugin_tag)
      addlog.unshift(actmeta.plugin_name)
      addlog.unshift('plugin')
    }

    logger.debug.apply( self, addlog )
    private$.actrouter.add(pattern,actmeta)
  }

  return self
}
