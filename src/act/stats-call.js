// Resolve action stats object, creating if ncessary, and count a call.
//
//    * _pattern_     (string)    &rarr;  action pattern
module.exports = function act_stats_call( pattern ) {
  var actstats = (private$.stats.actmap[pattern] =
                  private$.stats.actmap[pattern] || {})

  private$.stats.act.calls++
  actstats.calls++

  return actstats
}
