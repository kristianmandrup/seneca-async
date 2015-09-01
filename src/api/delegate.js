var _            = require('lodash');

module.exports = function api_delegate(fixedargs) {
  var self = this

  var delegate = Object.create(self)
  var act = self.act

  delegate.did = refnid()

  var strdesc
  delegate.toString = function() {
    if( strdesc ) return strdesc;
    var vfa = {}
    _.each(fixedargs,function(v,k) {
      if( ~k.indexOf('$') ) return;
      vfa[k]=v
    })

    strdesc = self.toString()+
      (_.keys(vfa).length?'/'+jsonic.stringify(vfa):'')

    return strdesc
  }

  delegate.fixedargs = ( so.strict.fixedargs ?
                         _.extend({}, fixedargs,self.fixedargs) :
                         _.extend({}, self.fixedargs,fixedargs) )

  delegate.delegate = function(further_fixedargs) {
    var args = _.extend({}, delegate.fixedargs, further_fixedargs||{})
    return self.delegate.call(this,args)
  }

  // Somewhere to put contextual data for this delegate.
  // For example, data for individual web requests.
  delegate.context = {}

  delegate.client = function() {
    return self.client.call(this, arguments)
  }

  delegate.listen = function() {
    return self.listen.call(this, arguments)
  }

  return delegate
}
