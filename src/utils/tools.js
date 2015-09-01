var nid     = require('nid');
var actnid  = nid({length:5});

module.exports = {
  actnid: actnid,
  refnid: function(){ return '('+actnid()+')' }
}
