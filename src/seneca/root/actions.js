var action = require('../../action')

module.exports.decorate = function decorate(root) {
  // Add builtin actions.
  root.add( {role:'seneca',  stats:true},  action.stats )
  root.add( {role:'seneca',  ready:true},  action.ready )
  root.add( {role:'seneca',  cmd:'close'}, action.close )
  root.add( {role:'options', cmd:'get'},   action.options_get  )
  return root;
}
