module.exports = function api_error( errhandler ) {
  this.options( {errhandler:errhandler} )
  return this
}
