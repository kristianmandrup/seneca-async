// all optional
module.exports = function api_make() {
  var self = this
  var args = arr(arguments)
  args.unshift(self)
  return private$.entity.make$.apply(private$.entity,args)
}
