var _            = require('lodash');
var common       = require('./lib/common');

module.exports = {
  close: async function action_seneca_close(args) {
    await this.emit('close')
  },
  ready: async function action_seneca_ready(args) {
    private$.wait_for_ready = false
    await this.emit('ready')
  },
  stats: async function action_seneca_stats( args ) {
    var stats

    // TODO: await stats
    if( args.pattern && private$.stats.actmap[args.pattern] ) {
      stats = private$.stats.actmap[args.pattern]
      stats.time = private$.timestats.calculate(args.pattern)
    }
    else {
      stats = _.clone(private$.stats)
      stats.now    = new Date()
      stats.uptime = stats.now - stats.start

      stats.now   = new Date(stats.now).toISOString()
      stats.start = new Date(stats.start).toISOString()

      var summary =
            (null == args.summary && false) ||
            (/^false$/i.exec(args.summary) ? false : !!(args.summary) )

      if( summary ) {
        stats.actmap = void 0
      }
      else {
        _.each( private$.stats.actmap, function(a,p) {
          private$.stats.actmap[p].time = private$.timestats.calculate(p)
        })
      }
    }

    // done(null,stats)
  },
  options_get: async function action_options_get( args ) {
    var options = private$.optioner.get()

    var base = args.base || null
    var root = base ? (options[base]||{}) : options
    var val  = args.key ? root[args.key] : root

    await common.copydata(val);
    // done(null,common.copydata(val))
  }

}
