module.exports = function(private$, so) {
  var so = this.so || so;

  // setup status log
  if( 0 < so.status.interval && so.status.running ) {
    private$.stats = private$.stats || {}
    setInterval(function() {
      var status = {
        alive: (Date.now()-private$.stats.start),
        act:   private$.stats.act
      }
      root.log.info('status',status)
    },so.status.interval)
  }

  if( so.stats ) {
    private$.timestats = new stats.NamedStats( so.stats.size, so.stats.interval )

    if( so.stats.running ) {
      setInterval(function() {
        private$.timestats.calculate()
      }, so.stats.interval )
    }
  }

  private$.plugins      = {}
  private$.exports      = { options: common.deepextend({},so) }
  private$.plugin_order = { byname:[], byref:[] }
  private$.use          = makeuse({
    prefix:    'seneca-',
    module:    module,
    msgprefix: false,
    builtin:   ''
  })

  private$.actcache = ( so.actcache.active ?
                        lrucache({max:so.actcache.size}) :
                        {set:_.noop} )

  private$.wait_for_ready = false

  private$.actrouter    = so.internal.actrouter
  private$.clientrouter = so.internal.clientrouter
  private$.subrouter    = so.internal.subrouter

  return private$;
}
