var api = require('../../api')
var extend = require('extend')

module.exports.decorate = function decorate(root) {
  // Seneca methods. Official API.
  root = extend(root, api)

  // Method aliases.
  root.make$      = api.make
  root.hasact     = api.has

  // Legacy API; Deprecated.
  root.startrepl = api.repl
  root.findact   = api.find
  return root;
}
