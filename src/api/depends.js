"use strict";
var _            = require('lodash');
var norma        = require('norma');

module.exports = function api_depends() {
  var self = this

  var args = norma('{pluginname:s deps:a? moredeps:s*}',arguments)

  var deps = args.deps || args.moredeps

  _.every(deps, function(depname) {
    if( !_.contains(private$.plugin_order.byname,depname) &&
        !_.contains(private$.plugin_order.byname,'seneca-'+depname) ) {
      self.die(error('plugin_required',{name:args.pluginname,dependency:depname}))
      return false
    }
    else return true;
  })
}
