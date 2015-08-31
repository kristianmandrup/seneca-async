module.exports = function api_export( key ) {
  var self = this

  // Legacy aliases
  if( 'util' == key ) key = 'basic';

  var exportval = private$.exports[key];
  if( !exportval ) {
    return self.die(error('export_not_found', {key:key}))
  }

  return exportval;
}
