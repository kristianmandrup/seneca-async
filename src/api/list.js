var _            = require('lodash');
var jsonic       = require('jsonic');

module.exports = function api_list( args ) {
  args = _.isString(args) ? jsonic(args) : args

  var found = private$.actrouter.list( args )

  found = _.map( found, function(entry) {
    return entry.match
  })

  return found
}
