function api_register( plugin ) {
  var self = this

  paramcheck.register.validate(plugin,thrower)

  var fullname = plugin.name+(plugin.tag?'/'+plugin.tag:'')
  var tag      = plugin.tag||'-'

  plugin.fullname = fullname

  var sd = plugin_util.make_delegate(
    self,
    plugin,
    {makedie:makedie}
  )

  self.log.debug( 'register', 'init', fullname, callpoint() )

  var plugin_options = plugin_util.resolve_options(fullname,plugin,so)

  sd.log.debug('DEFINE',plugin_options)

  var meta
  try {
    meta = plugin_util.define_plugin( sd, plugin, plugin_options )
  }
  catch(e) {
    return sd.die(e)
  }

  // legacy api for service function
  if( _.isFunction(meta) ) {
    meta = {service:meta}
  }

  plugin.name = meta.name || plugin.name
  plugin.tag =
    meta.tag ||
    plugin.tag ||
    (plugin.options && plugin.options.tag$)

  plugin.fullname = plugin.name+(plugin.tag?'/'+plugin.tag:'')

  plugin.service = meta.service || plugin.service

  sd.__update_plugin__(plugin)

  var pluginref = plugin.name+(plugin.tag?'/'+plugin.tag:'')
  private$.plugins[pluginref] = plugin

  private$.plugin_order.byname.push(plugin.name)
  private$.plugin_order.byname = _.uniq(private$.plugin_order.byname)

  private$.plugin_order.byref.push(pluginref)

  // LEGACY
  var service = plugin.service
  if( service ) {
    service.log = sd.log
    service.key = pluginref
    self.act('role:web',{use:service})
  }

  try {
    await self.act({
        init:     plugin.name,
        tag:      plugin.tag,
        default$: {},
        gate$:    true,
        fatal$:   true,
        local$:   true
    })
    if( so.debug.print && so.debug.print.options ) {
      console_log('\nSeneca Options ('+self.id+'): plugin: '+plugin.name+
                  (plugin.tag?'$'+plugin.tag:'')+'\n'+
                  '===\n')
      console_log(util.inspect(plugin_options,{depth:null}))
      console_log('')
    }
    return self.log.debug( 'register', 'ready', pluginref, out )
  } catch (err) {
    var plugin_err_code = 'plugin_init'

    plugin.plugin_error = err.message

    if( 'action-timeout' == err.code ) {
      plugin_err_code = 'plugin_init_timeout'
      plugin.timeout = so.timeout
    }

    return self.die(error(err,plugin_err_code,plugin))
  }

  var exports = []

  if( void 0 != meta.export ) {
    private$.exports[pluginref] = meta.export
    exports.push(pluginref)
  }

  if( _.isObject(meta.exportmap) || _.isObject(meta.exports) ) {
    meta.exportmap = meta.exportmap || meta.exports
    _.each(meta.exportmap,function(v,k) {
      if( void 0 != v ) {
        var exportname = pluginref+'/'+k
        private$.exports[exportname] = v
        exports.push(exportname)
      }
    })
  }

  self.log.debug('register','install',pluginref,
                 {exports:exports},fullname!=pluginref?fullname:undefined)
}
