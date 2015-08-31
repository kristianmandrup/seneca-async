module.exports = function api_fix() {
  var self = this

  var defargs = parse_pattern(self,arguments)

  var fix = self.delegate( defargs.pattern )

  fix.add = function() {
    var args    = parse_pattern(fix,arguments,'rest:.*',defargs.pattern)
    var addargs = [args.pattern].concat(args.rest)
    return self.add.apply(fix,addargs)
  }

  return fix
}
