var _   = require('lodash');
var norma        = require('norma');
var jsonic       = require('jsonic');

// string args override object args
module.exports = function parse_pattern(instance,args,normaspec,fixed) {
  args = norma('{strargs:s? objargs:o? moreobjargs:o? '+(normaspec||'')+'}', args)

  try {
    return _.extend(
      args,
      { pattern: _.extend(
        {},

        // Precedence of arguments in add,act is left-to-right
        args.moreobjargs ? args.moreobjargs : {},
        args.objargs ? args.objargs : {},
        args.strargs ? jsonic( args.strargs ) : {},

        fixed || {} )
      })
  }
  catch( e ) {
    var col = 1==e.line?e.column-1:e.column
    throw error('add_string_pattern_syntax',{
      argstr: args,
      syntax: e.message,
      line:   e.line,
      col:    col
    })
  }
}
