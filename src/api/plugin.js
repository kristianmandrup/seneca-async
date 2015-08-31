module.exports.hasplugin = function (plugindesc,tag) {
  var self = this
  tag = ('' === tag || '-' === tag) ? null : tag
  return !!self.findplugin(plugindesc,tag)
}

// get plugin instance
module.exports.findplugin = function (plugindesc,tag) {
  var name = plugindesc.name || plugindesc
  tag = plugindesc.tag || tag

  var key = name+(tag?'/'+tag:'')
  var plugin = private$.plugins[key]

  return plugin
}
