module.exports = function api_act_if() {
  var self = this
  var args = norma('{execute:b actargs:.*}',arguments)

  if( args.execute ) {
    return self.act.apply( self, args.actargs )
  }
  else return self;
}
