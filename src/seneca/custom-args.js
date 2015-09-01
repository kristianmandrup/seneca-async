module.exports = {
  rules: {
    entity$: function(ctxt,cb) {
      var val = ctxt.point
      if( val.entity$ ) {
        if( val.canon$({isa:ctxt.rule.spec}) ) {
          return cb();
        }
        else return ctxt.util.fail(ctxt,cb);
      }
      else return ctxt.util.fail(ctxt,cb);
    }
  },
  msgs: {
    entity$: 'The value <%=value%> is not a data entity of kind <%=rule.spec%>'+
      ' (property <%=parentpath%>).'
  }
}
