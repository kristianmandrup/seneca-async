var logging      = require('../lib/logging');

module.exports = function(root) {
  return function api_logroute(entry,handler) {
    if( 0 === arguments.length ) return root.log.router.toString()

    entry.handler = handler || entry.handler
    logging.makelogroute(entry,root.log.router)
  }
}
