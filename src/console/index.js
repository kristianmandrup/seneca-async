// Intentional console output uses this function. Helps to find spurious debugging.
module.exports.log = function console_log() {
  console.log.apply(null,arguments)
}

// Intentional console errors use this function. Helps to find spurious debugging.
module.exports.error = function console_error() {
  console.error.apply(null,arguments)
}
